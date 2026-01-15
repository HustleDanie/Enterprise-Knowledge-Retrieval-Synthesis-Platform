from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=20)
    rerank_k: int = Field(default=3, ge=1, le=20)
    use_hybrid_search: bool = Field(default=True)
    include_sources: bool = Field(default=True)


class CitationSchema(BaseModel):
    id: str = ""
    score: float = 0.0
    metadata: Dict[str, Any] = {}


class QueryResponse(BaseModel):
    response: str
    citations: List[CitationSchema] = []
    confidence_score: float = Field(ge=0, le=1)
    retrieved_count: int
    reranked_count: int
    processing_time_ms: float


class DocumentChunk(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    confidence: float


class DocumentUploadRequest(BaseModel):
    file_name: str
    file_content: str
    metadata: Optional[Dict[str, Any]] = None
    source: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    services: Dict[str, str]


class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: datetime
