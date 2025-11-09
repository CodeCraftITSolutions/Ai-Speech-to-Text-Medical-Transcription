from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.domain import models
from app.infra.logging import logger
from app.settings import get_settings

try:  # pragma: no cover - imported lazily during runtime
    from alembic import command
    from alembic.config import Config
except Exception:  # pragma: no cover - alembic is always installed but guard just in case
    command = None
    Config = None

settings = get_settings()

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)
    return _engine


def get_sessionmaker():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autocommit=False, autoflush=False, future=True)
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    session_local = get_sessionmaker()
    db = session_local()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    session_local = get_sessionmaker()
    session = session_local()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def health_check() -> bool:
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def run_migrations() -> None:
    """Run database migrations to ensure the schema is up to date."""
    if command is None or Config is None:
        logger.warning("Alembic is not available; skipping automatic migrations")
        return

    project_root = Path(__file__).resolve().parents[2]
    alembic_ini = project_root / "alembic.ini"
    migrations_dir = project_root / "migrations"

    if not alembic_ini.exists() or not migrations_dir.exists():
        logger.warning(
            "Alembic configuration not found at %s or %s; skipping automatic migrations",
            alembic_ini,
            migrations_dir,
        )
        return

    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("script_location", str(migrations_dir))

    logger.info("Running database migrations")
    command.upgrade(alembic_cfg, "head")


__all__ = [
    "get_engine",
    "get_sessionmaker",
    "get_db",
    "session_scope",
    "health_check",
    "run_migrations",
    "models",
]
