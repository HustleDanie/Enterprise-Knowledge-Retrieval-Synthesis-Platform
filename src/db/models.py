from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="user")  # admin, curator, user
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    api_keys = relationship("APIKey", back_populates="user")


class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    key_hash = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="api_keys")


class DocumentMetadata(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True)
    doc_name = Column(String, nullable=False)
    source = Column(String, nullable=False)
    file_size = Column(Integer)
    content_hash = Column(String, unique=True, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    indexed_at = Column(DateTime)
    
    chunks = relationship("Chunk", back_populates="document")


class Chunk(Base):
    __tablename__ = "chunks"
    
    id = Column(String, primary_key=True)
    doc_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer)
    content = Column(Text, nullable=False)
    embedding_id = Column(String)  # Reference to vector DB
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("DocumentMetadata", back_populates="chunks")


class SearchLog(Base):
    __tablename__ = "search_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    query = Column(Text, nullable=False)
    results_count = Column(Integer)
    response_time_ms = Column(Float)
    generated_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelMetric(Base):
    __tablename__ = "model_metrics"
    
    id = Column(String, primary_key=True)
    model_name = Column(String, nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
