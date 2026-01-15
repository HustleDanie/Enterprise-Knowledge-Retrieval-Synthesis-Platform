import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)


class VectorStore:
    
    def __init__(self, vector_db_type: str = "chroma", **kwargs):
        self.vector_db_type = vector_db_type
        self.config = kwargs
        
        if vector_db_type == "chroma":
            self.store = ChromaVectorStore(**kwargs)
        elif vector_db_type == "pinecone":
            self.store = PineconeVectorStore(**kwargs)
        else:
            raise ValueError(f"Unknown vector database type: {vector_db_type}")
    
    def add(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict[str, Any]]) -> None:
        self.store.add(ids, embeddings, metadata)
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[str, float, Dict]]:
        return self.store.search(query_embedding, top_k)
    
    def get_by_id(self, id: str) -> Optional[Tuple[np.ndarray, Dict]]:
        return self.store.get_by_id(id)
    
    def delete(self, ids: List[str]) -> None:
        self.store.delete(ids)
    
    def update(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict]) -> None:
        self.store.update(ids, embeddings, metadata)


class ChromaVectorStore:
    
    def __init__(self, persist_dir: str = "./data/chroma_db", **kwargs):
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=persist_dir)
            self.collection = self.client.get_or_create_collection(
                name="documents",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Initialized Chroma store at {persist_dir}")
        except ImportError:
            raise ImportError("Please install chromadb: pip install chromadb")
    
    def add(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict]) -> None:
        # Convert embeddings to list format for Chroma
        embeddings_list = [emb.tolist() if isinstance(emb, np.ndarray) else emb for emb in embeddings]
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings_list,
            metadatas=metadata
        )
        logger.info(f"Added {len(ids)} embeddings to Chroma")
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[str, float, Dict]]:
        query_list = query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding

        results = self.collection.query(
            query_embeddings=[query_list],
            n_results=top_k
        )
        
        # Format results
        output = []
        for i, id in enumerate(results['ids'][0]):
            distance = 1 - results['distances'][0][i]  # Convert distance to similarity
            metadata = results['metadatas'][0][i]
            output.append((id, distance, metadata))
        
        return output
    
    def get_by_id(self, id: str) -> Optional[Tuple[np.ndarray, Dict]]:
        try:
            result = self.collection.get(ids=[id])
            if result['embeddings']:
                embedding = np.array(result['embeddings'][0], dtype=np.float32)
                metadata = result['metadatas'][0]
                return (embedding, metadata)
        except Exception as e:
            logger.warning(f"Error retrieving {id}: {str(e)}")
        return None
    
    def delete(self, ids: List[str]) -> None:
        self.collection.delete(ids=ids)
        logger.info(f"Deleted {len(ids)} embeddings from Chroma")
    
    def update(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict]) -> None:
        embeddings_list = [emb.tolist() if isinstance(emb, np.ndarray) else emb for emb in embeddings]
        self.collection.update(
            ids=ids,
            embeddings=embeddings_list,
            metadatas=metadata
        )
        logger.info(f"Updated {len(ids)} embeddings in Chroma")


class PineconeVectorStore:
    
    def __init__(self, api_key: str, index_name: str = "knowledge-base", **kwargs):
        try:
            from pinecone import Pinecone
            self.client = Pinecone(api_key=api_key)
            self.index = self.client.Index(index_name)
            logger.info(f"Initialized Pinecone index: {index_name}")
        except ImportError:
            raise ImportError("Please install pinecone-client: pip install pinecone-client")
    
    def add(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict]) -> None:
        vectors = []
        for i, (id, emb, meta) in enumerate(zip(ids, embeddings, metadata)):
            emb_list = emb.tolist() if isinstance(emb, np.ndarray) else emb
            vectors.append((id, emb_list, meta))
        
        self.index.upsert(vectors=vectors)
        logger.info(f"Added {len(ids)} embeddings to Pinecone")
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[str, float, Dict]]:
        query_list = query_embedding.tolist() if isinstance(query_embedding, np.ndarray) else query_embedding

        results = self.index.query(vector=query_list, top_k=top_k, include_metadata=True)
        
        # Format results
        output = []
        for match in results['matches']:
            output.append((match['id'], match['score'], match.get('metadata', {})))
        
        return output
    
    def get_by_id(self, id: str) -> Optional[Tuple[np.ndarray, Dict]]:
        try:
            result = self.index.fetch(ids=[id])
            if result['vectors']:
                vector_data = result['vectors'][id]
                embedding = np.array(vector_data['values'], dtype=np.float32)
                metadata = vector_data.get('metadata', {})
                return (embedding, metadata)
        except Exception as e:
            logger.warning(f"Error retrieving {id}: {str(e)}")
        return None
    
    def delete(self, ids: List[str]) -> None:
        self.index.delete(ids=ids)
        logger.info(f"Deleted {len(ids)} embeddings from Pinecone")
    
    def update(self, ids: List[str], embeddings: List[np.ndarray], metadata: List[Dict]) -> None:
        self.add(ids, embeddings, metadata)
