import logging
from typing import List, Dict, Any, Set
import re

logger = logging.getLogger(__name__)


class HybridRetriever:
    
    def __init__(self, alpha: float = 0.7):
        self.alpha = alpha
    
    def retrieve(self, query: str, semantic_results: List[Dict[str, Any]], 
                 all_chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        # Get keyword search results
        keyword_results = self._keyword_search(query, all_chunks, top_k * 2)
        
        # Combine scores using RRF (Reciprocal Rank Fusion)
        combined = self._reciprocal_rank_fusion(
            semantic_results, 
            keyword_results, 
            k=60
        )
        
        return combined[:top_k]
    
    def _keyword_search(self, query: str, chunks: List[Dict[str, Any]], 
                       top_k: int) -> List[Dict[str, Any]]:
        query_terms = set(self._tokenize(query.lower()))
        scores = []
        
        for chunk in chunks:
            chunk_terms = set(self._tokenize(chunk['content'].lower()))
            
            # Simple TF-IDF approximation
            overlap = query_terms & chunk_terms
            if overlap:
                # Boost exact phrase matches
                exact_match_bonus = 0.5 if query.lower() in chunk['content'].lower() else 0
                score = (len(overlap) / len(query_terms)) + exact_match_bonus
                
                scores.append({
                    "id": chunk['chunk_id'],
                    "score": score,
                    "text": chunk['content'],
                    "metadata": {
                        "filename": chunk.get('filename', ''),
                        "chunk_index": chunk.get('index', 0)
                    }
                })
        
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:top_k]
    
    def _reciprocal_rank_fusion(self, list1: List[Dict], list2: List[Dict], 
                                k: int = 60) -> List[Dict]:
        scores = {}
        
        # Process semantic results
        for rank, item in enumerate(list1, 1):
            item_id = item['id']
            scores[item_id] = scores.get(item_id, {'item': item, 'score': 0})
            scores[item_id]['score'] += self.alpha * (1 / (rank + k))
        
        # Process keyword results
        for rank, item in enumerate(list2, 1):
            item_id = item['id']
            if item_id not in scores:
                scores[item_id] = {'item': item, 'score': 0}
            scores[item_id]['score'] += (1 - self.alpha) * (1 / (rank + k))
        
        # Sort by combined score
        ranked = sorted(scores.values(), key=lambda x: x['score'], reverse=True)
        return [item['item'] for item in ranked]
    
    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())


class QueryRewriter:
    
    def rewrite(self, query: str) -> List[str]:
        variations = [query]
        
        # Add question variations
        if not query.endswith('?'):
            variations.append(query + '?')
        
        # Remove question words for keyword search
        keywords = re.sub(r'\b(what|when|where|who|why|how|is|are|the|a|an)\b', '', query, flags=re.IGNORECASE)
        keywords = ' '.join(keywords.split())
        if keywords != query:
            variations.append(keywords)
        
        return variations
