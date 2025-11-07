import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from typing import Generator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

os.environ.setdefault("APP_NAME", "Test API")
os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_app.db")
os.environ.setdefault("BROKER_URL", "redis://localhost:6379/0")
os.environ.setdefault("STORAGE_ENDPOINT", "http://localhost:9000")
os.environ.setdefault("STORAGE_BUCKET", "test-bucket")
os.environ.setdefault("STORAGE_KEY", "minioadmin")
os.environ.setdefault("STORAGE_SECRET", "minioadmin")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
os.environ.setdefault("ASR_MODEL", "whisper-lightweight")

from app.domain.models import Base  # noqa: E402

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def cleanup_tables() -> Generator[None, None, None]:
    yield
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())

