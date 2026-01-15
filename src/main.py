import logging
import sys
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from src.config import Settings, get_settings
from src.api import router as api_router
from src.monitoring import MLflowTracker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/app.log")
    ]
)
logger = logging.getLogger(__name__)


def _prewarm_services():
    """Pre-load heavy services so first request is fast."""
    try:
        from src.api.routes import get_embedding_service, get_vector_store, get_llm_client
        logger.info("Pre-warming: embedding model...")
        get_embedding_service()
        logger.info("Pre-warming: vector store...")
        get_vector_store()
        logger.info("Pre-warming: LLM client...")
        get_llm_client()
        logger.info("Pre-warming complete")
    except Exception as e:
        logger.warning(f"Pre-warming failed (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Application startup")
    
    # Pre-warm services in background thread to not block startup
    import threading
    warmup_thread = threading.Thread(target=_prewarm_services, daemon=True)
    warmup_thread.start()
    
    logger.info("Application startup complete - ready to accept requests")
    yield
    # Shutdown
    logger.info("Application shutdown")


def create_app(settings: Settings = None) -> FastAPI:
    if settings is None:
        settings = get_settings()
    
    app = FastAPI(
        title=settings.api_title,
        description=settings.api_description,
        version=settings.api_version,
        lifespan=lifespan,
        debug=settings.debug
    )
    
    # Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0", "*"]
    )
    
    # Include routers
    app.include_router(api_router)
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "app_name": settings.app_name,
            "version": settings.app_version,
            "status": "running"
        }
    
    # Health endpoint
    @app.get("/health")
    async def health():
        return {
            "status": "ok",
            "version": settings.app_version,
            "timestamp": datetime.now().isoformat(),
            "services": {
                "database": "ok",
                "cache": "ok"
            }
        }
    
    # Favicon endpoint to prevent 404s
    @app.get("/favicon.ico")
    async def favicon():
        return {"message": "No favicon"}
    
    logger.info("FastAPI application created")
    return app


# Create application instance
app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    
    run_kwargs = {
        "app": "main:app",
        "host": settings.host,
        "port": settings.port,
        "workers": settings.workers,
        "reload": settings.debug,
    }
    
    # Fix Windows asyncio crash (ProactorEventLoop AssertionError)
    if sys.platform == "win32":
        run_kwargs["loop"] = "asyncio"
    
    uvicorn.run(**run_kwargs)
