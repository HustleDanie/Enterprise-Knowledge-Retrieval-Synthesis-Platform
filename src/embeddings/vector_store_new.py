import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)


class VectorStore:
    
    def __init__(self, db_type: str = "chroma", collection_name: str = "documents"):
        self.db_type = db_type
        self.collection_name = collection_name
        self.client = None
        self.collection = None
        
        if db_type == "chroma":
            self._init_chroma()
        elif db_type == "pinecone":
            self._init_pinecone()
        else:
            self._init_memory()
    
    def _init_chroma(self):
        try:
            import chromadb
            import os
            
            persist_dir = os.path.abspath("./data/chroma")
            os.makedirs(persist_dir, exist_ok=True)
            
            # ChromaDB 1.x+ uses PersistentClient
            self.client = chromadb.PersistentClient(path=persist_dir)
            
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "RAG document chunks"}
            )
            logger.info(f"[OK] ChromaDB initialized: {self.collection_name} ({self.collection.count()} docs)")
        except Exception as e:
            logger.warning(f"ChromaDB init failed: {e}, using in-memory")
            self._init_memory()
    
    def _init_pinecone(self):
        try:
            import pinecone
            import os
            
            api_key = os.getenv("PINECONE_API_KEY")
            if not api_key:
                logger.warning("PINECONE_API_KEY not set, using in-memory")
                self._init_memory()
                return
            
            pinecone.init(api_key=api_key, environment=os.getenv("PINECONE_ENV", "us-west1-gcp"))
            
            if self.collection_name not in pinecone.list_indexes():
                pinecone.create_index(self.collection_name, dimension=384, metric="cosine")
            
            self.collection = pinecone.Index(self.collection_name)
            logger.info(f"[OK] Pinecone initialized: {self.collection_name}")
        except Exception as e:
            logger.warning(f"Pinecone init failed: {e}, using in-memory")
            self._init_memory()
    
    def _init_memory(self):
        self.db_type = "memory"
        self.collection = {"vectors": []}
        logger.info("[OK] In-memory vector store initialized")
    
    def add_documents(self, ids: List[str], embeddings: List[List[float]], 
                     metadata: List[Dict[str, Any]], texts: List[str]):
        try:
            if self.db_type == "chroma":
                self.collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadata,
                    documents=texts
                )
            elif self.db_type == "pinecone":
                vectors = [(id, emb, meta) for id, emb, meta in zip(ids, embeddings, metadata)]
                self.collection.upsert(vectors=vectors)
            else:
                for id, emb, meta, text in zip(ids, embeddings, metadata, texts):
                    self.collection["vectors"].append({
                        "id": id,
                        "embedding": np.array(emb),
                        "metadata": meta,
                        "text": text
                    })
            
            logger.info(f"[OK] Added {len(ids)} documents to vector store")
        except Exception as e:
            logger.error(f"Add documents failed: {e}")
            raise
    
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        try:
            if self.db_type == "chroma":
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k
                )
                
                return [
                    {
                        "id": results["ids"][0][i],
                        "score": 1 - results["distances"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "text": results["documents"][0][i]
                    }
                    for i in range(len(results["ids"][0]))
                ]
            
            elif self.db_type == "pinecone":
                results = self.collection.query(
                    vector=query_embedding,
                    top_k=top_k,
                    include_metadata=True
                )
                
                return [
                    {
                        "id": match.id,
                        "score": match.score,
                        "metadata": match.metadata,
                        "text": match.metadata.get("text", "")
                    }
                    for match in results.matches
                ]
            
            else:  # memory
                query_vec = np.array(query_embedding)
                scores = []
                
                for item in self.collection["vectors"]:
                    similarity = np.dot(query_vec, item["embedding"]) / (
                        np.linalg.norm(query_vec) * np.linalg.norm(item["embedding"])
                    )
                    scores.append({
                        "id": item["id"],
                        "score": float(similarity),
                        "metadata": item["metadata"],
                        "text": item["text"]
                    })
                
                scores.sort(key=lambda x: x["score"], reverse=True)
                return scores[:top_k]
                
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def count(self) -> int:
        if self.db_type == "chroma":
            return self.collection.count()
        elif self.db_type == "memory":
            return len(self.collection["vectors"])
        return 0
