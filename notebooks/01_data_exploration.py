"""Create sample notebooks for exploration and documentation."""

# Notebook 1: Data Exploration
notebook_1 = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# Enterprise Knowledge Retrieval - Data Exploration\n", "\n", "This notebook explores the document ingestion and embedding generation pipeline."]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["import sys\n", "sys.path.insert(0, '../')\n", "\n", "from src.ingestion import DocumentLoader, DocumentChunker\n", "from src.embeddings import EmbeddingService"]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["# Initialize components\n", "loader = DocumentLoader()\n", "chunker = DocumentChunker(chunk_size=1024, chunk_overlap=128)\n", "embedding_svc = EmbeddingService()"]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["## Load Sample Document"]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["# Create sample document\n", "sample_text = \"Sample document text for exploration...\""]
        }
    ],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.10.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

print("Sample notebook structure created")
