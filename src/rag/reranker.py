import logging
from typing import List, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class DocumentReranker:
    
    def __init__(self, model_type: str = "cross-encoder"):
        self.model_type = model_type
        self.model = self._load_model()
    
    def rerank(self, query: str, documents: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        if len(documents) <= top_k:
            return documents
        
        try:
            if self.model_type == "cross-encoder":
                return self._rerank_with_cross_encoder(query, documents, top_k)
            elif self.model_type == "llm":
                return self._rerank_with_llm(query, documents, top_k)
            else:
                logger.warning(f"Unknown reranker type: {self.model_type}")
                return documents[:top_k]
        except Exception as e:
            logger.error(f"Reranking failed: {str(e)}, returning original order")
            return documents[:top_k]
    
    def _rerank_with_cross_encoder(self, query: str, documents: List[Dict], top_k: int) -> List[Dict]:
        try:
            from sentence_transformers import CrossEncoder
            
            if not hasattr(self, '_cross_encoder'):
                self._cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            
            # Prepare text pairs
            pairs = [(query, doc.get('content', '')) for doc in documents]
            
            # Score pairs
            scores = self._cross_encoder.predict(pairs)
            
            # Sort by score and rerank
            ranked = sorted(
                zip(documents, scores),
                key=lambda x: x[1],
                reverse=True
            )
            
            reranked = []
            for doc, score in ranked[:top_k]:
                doc['rerank_score'] = float(score)
                reranked.append(doc)
            
            logger.debug(f"Reranked {len(documents)} documents using cross-encoder")
            return reranked
            
        except ImportError:
            logger.warning("sentence-transformers not installed for cross-encoder reranking")
            return documents[:top_k]
    
    def _rerank_with_llm(self, query: str, documents: List[Dict], top_k: int) -> List[Dict]:
        # Placeholder for LLM-based reranking
        logger.debug("LLM-based reranking (placeholder)")
        return documents[:top_k]
    
    def _load_model(self):
        try:
            from sentence_transformers import CrossEncoder
            return CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        except ImportError:
            logger.warning("sentence-transformers not available, using placeholder model")
            return None


class RAGChain:
    
    def __init__(self, retriever, reranker, llm_client):
        self.retriever = retriever
        self.reranker = reranker
        self.llm_client = llm_client
    
    def generate(self, query: str, top_k: int = 5, rerank_k: int = 3) -> Dict[str, Any]:
        # Retrieve documents
        retrieved = self.retriever.retrieve(query, top_k=top_k)
        
        if not retrieved:
            return {
                "response": "No relevant documents found.",
                "citations": [],
                "retrieved_count": 0
            }
        
        # Rerank documents
        reranked = self.reranker.rerank(query, retrieved, top_k=rerank_k)
        
        # Generate response
        context = self._build_context(reranked)
        response = self._generate_response(query, context)
        
        return {
            "response": response,
            "citations": [doc.get("id") for doc in reranked],
            "retrieved_count": len(retrieved),
            "reranked_count": len(reranked)
        }
    
    def _build_context(self, documents: List[Dict]) -> str:
        context_parts = []
        for i, doc in enumerate(documents, 1):
            content = doc.get('content', doc.get('metadata', {}).get('content', ''))
            context_parts.append(f"[Source {i}]: {content[:500]}")
        return "\n\n".join(context_parts)
    
    def _generate_response(self, query: str, context: str) -> str:
        prompt = f"""Based on the following context, answer the question accurately and concisely.

Question: {query}

Context:
{context}

Answer:"""
        
        # This would call the actual LLM
        logger.debug("Generating response (placeholder)")
        return "Response generation placeholder"
