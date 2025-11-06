from fastapi import APIRouter

from app.infra.db import health_check

router = APIRouter(prefix="/v1", tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready() -> dict[str, str]:
    return {"database": "ok" if health_check() else "unavailable"}

