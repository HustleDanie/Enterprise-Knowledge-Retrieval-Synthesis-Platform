"""
MLflow configuration and experiment tracking setup.
"""
import os
import logging

logger = logging.getLogger(__name__)

# MLflow configuration
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MLFLOW_EXPERIMENT_NAME = os.getenv("MLFLOW_EXPERIMENT_NAME", "retrieval-experiments")
MLFLOW_REGISTRY_URI = os.getenv("MLFLOW_REGISTRY_URI", None)

# Model registry configuration
MODEL_REGISTRY = {
    "embedding_model": {
        "name": "text-embedding-ada-002",
        "version": "latest",
        "stage": "Production"
    },
    "retrieval_model": {
        "name": "retrieval-ranker",
        "version": "1.0.0",
        "stage": "Staging"
    },
    "classifier_model": {
        "name": "chunk-classifier",
        "version": "1.0.0",
        "stage": "Development"
    }
}

# Evaluation metrics
EVAL_METRICS = {
    "retrieval": ["recall@k", "precision@k", "mrr", "ndcg"],
    "classification": ["accuracy", "f1", "precision", "recall"],
    "generation": ["bleu", "rouge", "meteor"]
}

# Experiment tracking
TRACKING_PARAMS = {
    "embedding_dim": 1536,
    "chunk_size": 1024,
    "top_k": 5,
    "model_type": "cross-encoder"
}
