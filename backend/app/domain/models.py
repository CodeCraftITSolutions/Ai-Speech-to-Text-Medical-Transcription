from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class UserRole(str, PyEnum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    ASSISTANT = "assistant"


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password: str = Column(String(255), nullable=False)
    role: str = Column(String(50), nullable=False, default=UserRole.ASSISTANT.value)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    jobs = relationship("Job", back_populates="user", cascade="all,delete-orphan")


class JobStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Job(Base):
    __tablename__ = "jobs"

    id: int = Column(Integer, primary_key=True, index=True)
    type: str = Column(String(100), nullable=False)
    status: str = Column(String(50), nullable=False, default=JobStatus.PENDING.value)
    input_uri: Optional[str] = Column(Text, nullable=True)
    output_uri: Optional[str] = Column(Text, nullable=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="jobs")


class Report(Base):
    __tablename__ = "reports"

    id: int = Column(Integer, primary_key=True, index=True)
    transcript_id: Optional[int] = Column(Integer, nullable=True)  # TODO: link to AI table
    format: str = Column(String(50), nullable=False)
    output_uri: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)

