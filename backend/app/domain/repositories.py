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

    def create(self, username: str, hashed_password: str, role: str) -> models.User:
        user = models.User(username=username, hashed_password=hashed_password, role=role)
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

