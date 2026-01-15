"""Configuration module for the retrieval platform."""
from .settings import Settings

def get_settings() -> Settings:
    """Get application settings instance."""
    return Settings()

__all__ = ["Settings", "get_settings"]
