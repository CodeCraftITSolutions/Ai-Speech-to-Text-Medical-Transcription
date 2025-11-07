from functools import lru_cache

from fastapi import Depends
from sqlalchemy.orm import Session

from app.domain.repositories import JobRepository, ReportRepository, UserRepository
from app.infra.db import get_db
from app.services.asr.whisper_service import WhisperService
from app.settings import Settings, get_settings


def get_settings_dependency() -> Settings:
    return get_settings()


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_job_repository(db: Session = Depends(get_db)) -> JobRepository:
    return JobRepository(db)


def get_report_repository(db: Session = Depends(get_db)) -> ReportRepository:
    return ReportRepository(db)


@lru_cache(maxsize=1)
def _get_whisper_service_cached(
    model_name: str,
    device: str | None,
    compute_type: str | None,
) -> WhisperService:
    return WhisperService(
        model_name=model_name,
        device=device,
        compute_type=compute_type,
    )


def get_whisper_service(
    settings: Settings = Depends(get_settings_dependency),
) -> WhisperService:
    return _get_whisper_service_cached(
        settings.ASR_MODEL,
        settings.ASR_WHISPER_DEVICE,
        settings.ASR_WHISPER_COMPUTE_TYPE,
    )

