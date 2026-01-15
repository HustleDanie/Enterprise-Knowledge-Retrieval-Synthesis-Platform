import logging
from typing import List, Tuple, Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)


class HybridRetriever:
    
    def __init__(self, vector_store, embedding_service, bm25_index: Optional[Any] = None):
        self.vector_store = vector_store
        self.embedding_service = embedding_service
        self.bm25_index = bm25_index
    
    def retrieve(self, query: str, top_k: int = 5, use_hybrid: bool = True) -> List[Dict[str, Any]]:
        if use_hybrid and self.bm25_index:
            return self._hybrid_search(query, top_k)
        else:
            return self._semantic_search(query, top_k)
    
    def _semantic_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        # Generate query embedding
        query_embedding = self.embedding_service.embed_text(query)
        
        # Search vector store
        results = self.vector_store.search(query_embedding, top_k=top_k)
        
        # Format results
        documents = []
        for doc_id, score, metadata in results:
            documents.append({
                "id": doc_id,
                "score": float(score),
                "metadata": metadata,
                "search_type": "semantic"
            })
        
        logger.debug(f"Semantic search returned {len(documents)} results")
        return documents
    
    def _hybrid_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        # Get semantic results
        semantic_results = self._semantic_search(query, top_k)
        
        # Get keyword results if BM25 index available
        keyword_results = []
        if self.bm25_index:
            keyword_results = self._keyword_search(query, top_k)
        
        # Merge and deduplicate results
        merged = self._merge_results(semantic_results, keyword_results, top_k)
        
        logger.debug(f"Hybrid search returned {len(merged)} results")
        return merged
    
    def _keyword_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        try:
            # This would use the BM25 index to search
            # Placeholder implementation
            logger.debug("BM25 keyword search (placeholder)")
            return []
        except Exception as e:
            logger.warning(f"Keyword search failed: {str(e)}")
            return []
    
    @staticmethod
    def _merge_results(semantic_results: List[Dict], keyword_results: List[Dict], top_k: int) -> List[Dict]:
        seen_ids = set()
        merged = []
        
        # Add semantic results first (usually more relevant)
        for result in semantic_results:
            if result["id"] not in seen_ids:
                merged.append(result)
                seen_ids.add(result["id"])
        
        # Add keyword results if not already seen
        for result in keyword_results:
            if result["id"] not in seen_ids and len(merged) < top_k:
                merged.append(result)
                seen_ids.add(result["id"])
        
        return merged[:top_k]


class QueryRewriter:
    
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    def rewrite_query(self, query: str, num_variations: int = 3) -> List[str]:
        variations = [query]  # Always include original
        
        try:
            # Use LLM to generate variations
            prompt = f"""Generate {num_variations} alternative phrasings of this query for better search results:
Original query: {query}

Return only the alternative queries, one per line."""
            
            # This would call the LLM
            logger.debug(f"Query rewriting for: {query}")
            # Placeholder - would call actual LLM
            
        except Exception as e:
            logger.warning(f"Query rewriting failed: {str(e)}")
        
        return variations
