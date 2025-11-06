# Medical Transcription Backend

This backend provides authentication, job orchestration, report generation, and integrations for the medical transcription platform. Speech-to-text and NLP components are intentionally left as TODOs for the AI-focused team.

## Features

- FastAPI application with JWT authentication and role-based access control (RBAC)
- PostgreSQL persistence via SQLAlchemy and Alembic migrations
- Redis/RQ job queue for transcription and report workflows
- MinIO/S3 object storage integration
- Prometheus metrics and health endpoints
- Docker Compose stack for local development
- Pytest suite covering auth, jobs, and reports flows

## Prerequisites

- Python 3.11
- [Poetry](https://python-poetry.org/docs/#installation) package manager. Install it with `pipx install poetry` or `pip install --user poetry` and then add Poetry to your `PATH` (restart your terminal afterwards).

If you prefer managing Python tools per-project, create a virtual environment first:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install poetry
```

Verify the installation with `poetry --version` before continuing.

## Getting Started

1. Copy `.env.example` to `.env` and adjust secrets as needed.
2. Install dependencies and start the stack:

```bash
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

Or use Docker Compose:

```bash
cd backend
docker-compose up --build
```

The API will be available at `http://localhost:8000`. Interactive docs live at `/docs`.

### Troubleshooting

- **`poetry` is not recognized**: Ensure Poetry is installed and available on your `PATH` (`pipx install poetry` or `pip install --user poetry`). On Windows PowerShell you may need to restart the terminal so the updated `PATH` is picked up.

Once Poetry resolves correctly, re-run the commands from the getting started section.

## Testing

```bash
cd backend
poetry run pytest
```

## TODO (AI Team)

- Implement Whisper and wav2vec transcription services in `app/services/asr/`
- Build NLP pipelines in `app/services/nlp/`
- Finalize real-time websocket streaming in `app/websocket/`
- Enhance audio utilities in `app/utils/audio.py`

