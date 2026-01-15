import logging
import hashlib
from typing import Optional
from datetime import datetime, timedelta
import jwt

logger = logging.getLogger(__name__)


class PIIRedactor:
    
    @staticmethod
    def redact_email(text: str) -> str:
        import re
        return re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL]', text)
    
    @staticmethod
    def redact_phone(text: str) -> str:
        import re
        return re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
    
    @staticmethod
    def redact_ssn(text: str) -> str:
        import re
        return re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)
    
    @staticmethod
    def redact_all(text: str) -> str:
        text = PIIRedactor.redact_email(text)
        text = PIIRedactor.redact_phone(text)
        text = PIIRedactor.redact_ssn(text)
        return text


class JWTManager:
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_token(self, data: dict, expires_in_hours: int = 24) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(hours=expires_in_hours)
        to_encode.update({"exp": expire})
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        except Exception as e:
            logger.error(f"Token creation error: {str(e)}")
            raise
    
    def verify_token(self, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None


class CacheManager:
    
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl_seconds = ttl_seconds
        self.cache = {}
    
    def get(self, key: str) -> Optional[object]:
        if key in self.cache:
            value, expiry = self.cache[key]
            if datetime.utcnow() < expiry:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: object, ttl_seconds: Optional[int] = None):
        ttl = ttl_seconds or self.ttl_seconds
        expiry = datetime.utcnow() + timedelta(seconds=ttl)
        self.cache[key] = (value, expiry)
    
    def clear(self):
        self.cache.clear()


def hash_string(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def generate_id(prefix: str = "") -> str:
    import uuid
    unique_id = str(uuid.uuid4()).replace("-", "")
    return f"{prefix}_{unique_id}" if prefix else unique_id
