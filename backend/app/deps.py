from fastapi import Depends
from sqlalchemy.orm import Session

from app.domain.repositories import JobRepository, ReportRepository, UserRepository
from app.infra.db import get_db
from app.settings import Settings, get_settings


def get_settings_dependency() -> Settings:
    return get_settings()


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_job_repository(db: Session = Depends(get_db)) -> JobRepository:
    return JobRepository(db)


def get_report_repository(db: Session = Depends(get_db)) -> ReportRepository:
    return ReportRepository(db)

