from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from . import models, schemas


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.username == username).first()

    def get(self, user_id: int) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def list_by_role(self, role: str):
        return (
            self.db.query(models.User)
            .filter(models.User.role == role)
            .order_by(models.User.created_at.asc())
            .all()
        )

    def create(
        self,
        username: str,
        hashed_password: str,
        role: str,
        specialty: Optional[str] = None,
    ) -> models.User:
        normalized_specialty = specialty.strip() if isinstance(specialty, str) else None
        if not normalized_specialty:
            normalized_specialty = None

        user = models.User(
            username=username,
            hashed_password=hashed_password,
            role=role,
            specialty=normalized_specialty,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: models.User, **data) -> models.User:
        for field, value in data.items():
            setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, job_in: schemas.JobCreate) -> models.Job:
        job = models.Job(user_id=user_id, type=job_in.type, input_uri=job_in.input_uri)
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get(self, job_id: int) -> Optional[models.Job]:
        return self.db.query(models.Job).filter(models.Job.id == job_id).first()

    def list_for_user(self, user_id: int):
        return (
            self.db.query(models.Job)
            .filter(models.Job.user_id == user_id)
            .order_by(models.Job.created_at.desc())
            .all()
        )

    def list_for_review_queue(self, user_id: int):
        queue_statuses = (
            models.JobStatus.PENDING.value,
            models.JobStatus.PROCESSING.value,
            models.JobStatus.COMPLETED.value,
        )
        return (
            self.db.query(models.Job)
            .filter(models.Job.user_id == user_id, models.Job.status.in_(queue_statuses))
            .order_by(models.Job.created_at.asc())
            .all()
        )

    def update_status(self, job_id: int, status: str, output_uri: Optional[str] = None) -> Optional[models.Job]:
        job = self.get(job_id)
        if job:
            job.status = status
            if output_uri is not None:
                job.output_uri = output_uri
            self.db.commit()
            self.db.refresh(job)
        return job


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, report_in: schemas.ReportCreate, output_uri: str) -> models.Report:
        report = models.Report(
            transcript_id=report_in.transcript_id,
            format=report_in.format,
            output_uri=output_uri,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get(self, report_id: int) -> Optional[models.Report]:
        return self.db.query(models.Report).filter(models.Report.id == report_id).first()


class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_identifier(self, identifier: str) -> Optional[models.Patient]:
        return (
            self.db.query(models.Patient)
            .filter(models.Patient.patient_identifier == identifier)
            .first()
        )

    def create(
        self,
        *,
        patient_identifier: str,
        patient_name: str,
        patient_date_of_birth: Optional[date] = None,
    ):
        patient = models.Patient(
            patient_identifier=patient_identifier,
            patient_name=patient_name,
            patient_date_of_birth=patient_date_of_birth,
        )
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update(self, patient: models.Patient, **data) -> models.Patient:
        for field, value in data.items():
            setattr(patient, field, value)
        self.db.commit()
        self.db.refresh(patient)
        return patient


class TranscriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        patient_id: int,
        doctor_specialty: Optional[str],
        transcript_text: str,
        receptionist_id: Optional[int],
    ) -> models.Transcription:
        transcription = models.Transcription(
            patient_id=patient_id,
            doctor_specialty=doctor_specialty,
            transcript_text=transcript_text,
            receptionist_id=receptionist_id,
        )
        self.db.add(transcription)
        self.db.commit()
        self.db.refresh(transcription)
        return transcription

