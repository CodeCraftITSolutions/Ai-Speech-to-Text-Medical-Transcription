from datetime import datetime, date
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class UserRole(str, PyEnum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    TRANSCRIPTIONIST = "transcriptionist"
    RECEPTIONIST = "assistant"


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String(255), unique=True, nullable=False, index=True)
    first_name: Optional[str] = Column(String(255), nullable=True)
    last_name: Optional[str] = Column(String(255), nullable=True)
    phone_number: Optional[str] = Column(String(32), nullable=True)
    hashed_password: str = Column(String(255), nullable=False)
    role: str = Column(String(50), nullable=False, default=UserRole.TRANSCRIPTIONIST.value)
    specialty: Optional[str] = Column(String(255), nullable=True)
    totp_secret: Optional[str] = Column(String(255), nullable=True)
    totp_secret_pending: Optional[str] = Column(String(255), nullable=True)
    totp_enabled: bool = Column(Boolean, nullable=False, default=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    owned_jobs = relationship(
        "Job",
        back_populates="created_by",
        cascade="all,delete-orphan",
        foreign_keys="Job.created_by_id",
    )
    assigned_jobs = relationship(
        "Job",
        back_populates="assignee",
        foreign_keys="Job.assignee_id",
    )


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
    created_by_id: int = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    assignee_id: Optional[int] = Column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )
    transcription_id: Optional[int] = Column(
        Integer, ForeignKey("transcriptions.id"), nullable=True, index=True
    )
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    created_by = relationship(
        "User", back_populates="owned_jobs", foreign_keys=[created_by_id]
    )
    assignee = relationship(
        "User", back_populates="assigned_jobs", foreign_keys=[assignee_id]
    )
    transcription = relationship("Transcription", back_populates="job")


class Report(Base):
    __tablename__ = "reports"

    id: int = Column(Integer, primary_key=True, index=True)
    transcript_id: Optional[int] = Column(Integer, nullable=True)  # TODO: link to AI table
    format: str = Column(String(50), nullable=False)
    output_uri: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)


class Patient(Base):
    __tablename__ = "patients"

    id: int = Column(Integer, primary_key=True, index=True)
    patient_identifier: str = Column(String(64), unique=True, nullable=False, index=True)
    patient_name: str = Column(String(255), nullable=False)
    patient_date_of_birth: Optional[date] = Column(Date, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    transcriptions = relationship(
        "Transcription", back_populates="patient", cascade="all,delete-orphan"
    )


class Transcription(Base):
    __tablename__ = "transcriptions"

    id: int = Column(Integer, primary_key=True, index=True)
    patient_id: int = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_specialty: Optional[str] = Column(String(255), nullable=True)
    transcript_text: str = Column(Text, nullable=False)
    receptionist_id: Optional[int] = Column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    patient = relationship("Patient", back_populates="transcriptions")
    receptionist = relationship("User")
    job = relationship("Job", back_populates="transcription", uselist=False)

