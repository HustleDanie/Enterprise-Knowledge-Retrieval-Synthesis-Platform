import logging
from typing import List, Optional
import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingService:
    
    def __init__(self, model: str = "text-embedding-ada-002", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key
        self.provider = self._detect_provider(model)
        self._embedding_cache = {}
    
    def embed_text(self, text: str) -> np.ndarray:
        if text in self._embedding_cache:
            return self._embedding_cache[text]
        
        embedding = self._generate_embedding(text)
        self._embedding_cache[text] = embedding
        return embedding
    
    def embed_texts(self, texts: List[str], batch_size: int = 10) -> List[np.ndarray]:
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self._generate_batch_embeddings(batch)
            embeddings.extend(batch_embeddings)
            logger.debug(f"Generated embeddings for batch {i//batch_size + 1}")
        
        return embeddings
    
    def _generate_embedding(self, text: str) -> np.ndarray:
        if self.provider == "openai":
            return self._openai_embed(text)
        elif self.provider == "huggingface":
            return self._huggingface_embed(text)
        elif self.provider == "local":
            return self._local_embed(text)
        else:
            raise ValueError(f"Unknown embedding provider: {self.provider}")
    
    def _generate_batch_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        if self.provider == "openai":
            return self._openai_embed_batch(texts)
        elif self.provider == "huggingface":
            return self._huggingface_embed_batch(texts)
        else:
            return [self._generate_embedding(text) for text in texts]
    
    def _openai_embed(self, text: str) -> np.ndarray:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            response = client.embeddings.create(
                input=text,
                model=self.model
            )
            embedding = response.data[0].embedding
            return np.array(embedding, dtype=np.float32)
        except ImportError:
            logger.warning("OpenAI client not installed, using random embedding")
            return np.random.rand(1536).astype(np.float32)
    
    def _openai_embed_batch(self, texts: List[str]) -> List[np.ndarray]:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            response = client.embeddings.create(
                input=texts,
                model=self.model
            )
            embeddings = [np.array(item.embedding, dtype=np.float32) for item in response.data]
            return embeddings
        except ImportError:
            logger.warning("OpenAI client not installed, using random embeddings")
            return [np.random.rand(1536).astype(np.float32) for _ in texts]
    
    def _huggingface_embed(self, text: str) -> np.ndarray:
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.model)
            embedding = model.encode(text, convert_to_numpy=True)
            return embedding.astype(np.float32)
        except ImportError:
            logger.warning("sentence-transformers not installed, using random embedding")
            return np.random.rand(384).astype(np.float32)
    
    def _huggingface_embed_batch(self, texts: List[str]) -> List[np.ndarray]:
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.model)
            embeddings = model.encode(texts, convert_to_numpy=True, batch_size=32)
            return [emb.astype(np.float32) for emb in embeddings]
        except ImportError:
            logger.warning("sentence-transformers not installed, using random embeddings")
            return [np.random.rand(384).astype(np.float32) for _ in texts]
    
    def _local_embed(self, text: str) -> np.ndarray:
        # Placeholder for local embedding implementation
        logger.debug("Using local embedding (placeholder)")
        return np.random.rand(384).astype(np.float32)
    
    @staticmethod
    def _detect_provider(model: str) -> str:
        if "ada" in model.lower() or "3-small" in model.lower():
            return "openai"
        elif model.startswith("sentence-"):
            return "huggingface"
        else:
            return "huggingface"
