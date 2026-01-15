# Makefile for common tasks

.PHONY: help install dev test lint format clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Install dev dependencies"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code"
	@echo "  make clean        - Clean up artifacts"
	@echo "  make docker-up    - Start Docker services"
	@echo "  make docker-down  - Stop Docker services"
	@echo "  make run          - Run the application"

install:
	pip install -r requirements.txt

dev:
	pip install -r requirements.txt
	pip install pytest pytest-cov pytest-asyncio black flake8 mypy

test:
	pytest tests/ -v --cov=src

lint:
	flake8 src/
	mypy src/ --ignore-missing-imports

format:
	black src/ tests/
	isort src/ tests/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

run:
	uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

logs:
	docker-compose logs -f
