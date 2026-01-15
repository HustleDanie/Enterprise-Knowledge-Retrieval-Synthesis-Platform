import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    
    # App settings
    app_name: str = "Enterprise Knowledge Retrieval & Synthesis"
    app_version: str = "0.1.0"
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # API settings
    api_title: str = "Knowledge Retrieval API"
    api_description: str = "RAG-powered enterprise document search and synthesis"
    api_version: str = "v1"
    
    # Server settings
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    workers: int = Field(default=4)
    
    # Database settings
    postgres_url: Optional[str] = Field(default=None, alias="POSTGRES_URL")
    postgres_user: str = Field(default="postgres")
    postgres_password: str = Field(default="postgres")
    postgres_host: str = Field(default="localhost")
    postgres_port: int = Field(default=5432)
    postgres_db: str = Field(default="retrieval_db")
    
    # Vector DB settings
    vector_db_type: str = Field(default="chroma", alias="VECTOR_DB_TYPE")
    pinecone_api_key: Optional[str] = Field(default=None, alias="PINECONE_API_KEY")
    pinecone_index_name: str = Field(default="knowledge-base")
    pinecone_environment: str = Field(default="us-east1-aws")
    chroma_persist_dir: str = Field(default="./data/chroma_db")
    
    # Embedding settings (using local sentence-transformers by default - no API key needed)
    embedding_model: str = Field(default="all-MiniLM-L6-v2")
    embedding_api_key: Optional[str] = Field(default=None, alias="EMBEDDING_API_KEY")
    embedding_api_base: Optional[str] = Field(default=None, alias="EMBEDDING_API_BASE")
    embedding_dimension: int = Field(default=384)  # MiniLM uses 384 dimensions
    embedding_batch_size: int = Field(default=100)
    
    # LLM settings (local fallback mode - returns document excerpts without API)
    llm_provider: str = Field(default="local", alias="LLM_PROVIDER")
    llm_model: str = Field(default="none")
    llm_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    llm_api_base: Optional[str] = Field(default=None, alias="OPENAI_API_BASE")
    llm_temperature: float = Field(default=0.7)
    llm_max_tokens: int = Field(default=2048)
    
    # Ingestion settings
    chunk_size: int = Field(default=1024)
    chunk_overlap: int = Field(default=128)
    max_file_size_mb: int = Field(default=100)
    supported_formats: str = Field(default="pdf,docx,txt,md")
    
    # RAG settings
    retrieve_top_k: int = Field(default=5)
    rerank_top_k: int = Field(default=3)
    use_query_rewriting: bool = Field(default=True)
    enable_hybrid_search: bool = Field(default=True)
    
    # MLflow settings
    mlflow_tracking_uri: str = Field(default="http://localhost:5000")
    mlflow_experiment_name: str = Field(default="retrieval-experiments")
    mlflow_registry_uri: Optional[str] = Field(default=None)
    
    # Monitoring settings
    enable_prometheus: bool = Field(default=True)
    prometheus_port: int = Field(default=8001)
    enable_drift_detection: bool = Field(default=True)
    
    # RBAC and security
    enable_rbac: bool = Field(default=True)
    enable_pii_redaction: bool = Field(default=True)
    api_key_header: str = Field(default="X-API-Key")
    jwt_secret_key: Optional[str] = Field(default=None, alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256")
    
    # Logging settings
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        populate_by_name = True
    
    @property
    def database_url(self) -> str:
        if self.postgres_url:
            return self.postgres_url
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"


def get_settings() -> Settings:
    return Settings()
