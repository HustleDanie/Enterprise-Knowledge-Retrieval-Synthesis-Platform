# Enterprise Knowledge Retrieval & Synthesis Platform

A RAG (Retrieval Augmented Generation) system for enterprise document search and synthesis. Upload documents, search them with hybrid retrieval (semantic + keyword), and get LLM-generated answers grounded in your data.

## Architecture

```
User Interface (Next.js)
        │
   FastAPI Backend
        │
    RAG Pipeline
   ┌────┴─────┐
   │          │
Semantic   Keyword
(ChromaDB) (BM25)
   │          │
   └────┬─────┘
     Reranker (Cross-Encoder)
        │
   LLM Synthesis (Ollama / OpenAI)
        │
   Monitoring (MLflow, Prometheus)
```

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **Vector DB**: ChromaDB (with Pinecone support)
- **LLM**: Ollama (llama3.2) locally, OpenAI as fallback
- **Reranking**: Cross-encoder models
- **Database**: PostgreSQL (document metadata, RBAC)
- **Monitoring**: MLflow, Prometheus, Grafana, Evidently AI
- **CI/CD**: GitHub Actions, Docker

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com/) (for local LLM)

### Setup

```bash
git clone https://github.com/HustleDanie/Enterprise-Knowledge-Retrieval-Synthesis-Platform.git
cd Enterprise-Knowledge-Retrieval-Synthesis-Platform

# Backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..

# Pull LLM model
ollama pull llama3.2
```

### Running

```bash
# Terminal 1 - Backend (port 8000)
python run_server.py

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

### With Docker

```bash
docker-compose up -d
```

This starts PostgreSQL, ChromaDB, MLflow, Prometheus, and Grafana alongside the app.

## Project Structure

```
src/
├── main.py                  # FastAPI app entry point
├── api/
│   ├── routes.py            # API endpoints (upload, query, search)
│   └── schemas.py           # Request/response models
├── ingestion/
│   ├── document_loader.py   # PDF, DOCX, TXT, MD file loading
│   └── chunker.py           # Recursive text chunking
├── embeddings/
│   ├── embedding_service.py # Sentence-transformers wrapper
│   └── vector_store_new.py  # ChromaDB / Pinecone abstraction
├── rag/
│   ├── hybrid_retriever.py  # Semantic + BM25 with RRF fusion
│   ├── reranker.py          # Cross-encoder reranking
│   └── retriever.py         # Base retriever
├── db/
│   ├── models.py            # SQLAlchemy ORM models
│   └── postgres_client.py   # Database client
├── monitoring/
│   ├── mlflow_tracker.py    # Experiment tracking
│   └── metrics.py           # Prometheus metrics
└── utils/
    └── __init__.py          # PII redaction, auth, helpers

frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main 3-step UI
│   │   └── architecture/    # Architecture visualization
│   ├── components/          # Upload, Query, Results components
│   └── lib/                 # API client, hooks
```

## API

- `POST /api/v1/documents/upload` — Upload a document
- `POST /api/v1/query` — Query with RAG pipeline
- `GET /api/v1/documents` — List uploaded documents
- `GET /health` — Health check

Full docs at `http://localhost:8000/docs` (Swagger UI).

## How the RAG Pipeline Works

1. **Document ingestion** — Files are loaded, chunked (1024 tokens, 128 overlap), and embedded using sentence-transformers
2. **Hybrid search** — Incoming queries hit both semantic search (cosine similarity on embeddings) and keyword search (BM25 scoring)
3. **Reciprocal Rank Fusion** — Results from both searches are merged using RRF with alpha=0.7 weighting toward semantic
4. **Reranking** — A cross-encoder model rescores the top candidates for better precision
5. **LLM synthesis** — The top chunks are fed as context to the LLM (Ollama/OpenAI) to generate a grounded answer with citations

## Testing

```bash
pytest tests/ -v
pytest tests/ -v --cov=src
```

## License

MIT
