import logging
from typing import Dict

logger = logging.getLogger(__name__)


class MetricsCollector:
    
    def __init__(self):
        try:
            from prometheus_client import Counter, Histogram, Gauge
            self.Counter = Counter
            self.Histogram = Histogram
            self.Gauge = Gauge
            self._init_metrics()
            logger.info("Prometheus metrics initialized")
        except ImportError:
            logger.warning("prometheus-client not installed")
            self.Counter = None
    
    def _init_metrics(self):
        # Query metrics
        self.query_count = self.Counter(
            'retrieval_queries_total',
            'Total number of queries',
            ['status']
        )
        
        self.query_latency = self.Histogram(
            'retrieval_query_latency_ms',
            'Query latency in milliseconds'
        )
        
        # Document metrics
        self.document_count = self.Gauge(
            'retrieval_documents_indexed',
            'Number of indexed documents'
        )
        
        self.chunk_count = self.Gauge(
            'retrieval_chunks_total',
            'Total number of chunks'
        )
        
        # Embedding metrics
        self.embedding_time = self.Histogram(
            'retrieval_embedding_generation_ms',
            'Embedding generation time in milliseconds'
        )
        
        # Vector DB metrics
        self.vector_search_time = self.Histogram(
            'retrieval_vector_search_ms',
            'Vector search time in milliseconds'
        )
        
        # Model metrics
        self.retrieval_score = self.Histogram(
            'retrieval_relevance_score',
            'Relevance score of retrieved documents'
        )
    
    def record_query(self, latency_ms: float, status: str = "success"):
        if self.Counter:
            self.query_count.labels(status=status).inc()
            self.query_latency.observe(latency_ms)
    
    def set_document_count(self, count: int):
        if self.Gauge:
            self.document_count.set(count)
    
    def record_embedding_time(self, time_ms: float):
        if self.Histogram:
            self.embedding_time.observe(time_ms)
