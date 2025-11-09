from datetime import date, datetime
from typing import Any, Optional, Sequence

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None


class TokenPayload(BaseModel):
    sub: int
    exp: int
    type: str


class UserBase(BaseModel):
    username: str
    role: str = Field(default="assistant")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    specialty: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    specialty: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    totp_enabled: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserListItem(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    specialty: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class TOTPSetupResponse(BaseModel):
    secret: str
    otpauth_url: str


class TOTPVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=8)


class TOTPDisableRequest(BaseModel):
    current_password: str = Field(min_length=1)


class TOTPStatus(BaseModel):
    enabled: bool


class JobBase(BaseModel):
    type: str
    input_uri: Optional[str] = None
    transcription_id: Optional[int] = None
    assignee_id: Optional[int] = None


class JobCreate(JobBase):
    pass


class JobRead(JobBase):
    id: int
    status: str
    output_uri: Optional[str] = None
    created_by_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


def _normalise_status(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower()


class JobStats(BaseModel):
    total: int
    pending: int
    processing: int
    completed: int
    failed: int
    unknown: int
    in_queue: int
    ready_for_review: int

    @classmethod
    def from_jobs(cls, jobs: Sequence[Any]) -> "JobStats":
        counts = {"pending": 0, "processing": 0, "completed": 0, "failed": 0, "unknown": 0}
        for job in jobs:
            status = _normalise_status(getattr(job, "status", None))
            if status in counts:
                counts[status] += 1
            elif status:
                counts["unknown"] += 1
            else:
                counts["unknown"] += 1

        total = len(jobs)
        in_queue = counts["pending"] + counts["processing"]
        ready_for_review = counts["completed"]
        return cls(
            total=total,
            pending=counts["pending"],
            processing=counts["processing"],
            completed=counts["completed"],
            failed=counts["failed"],
            unknown=counts["unknown"],
            in_queue=in_queue,
            ready_for_review=ready_for_review,
        )


class JobHistoryResponse(BaseModel):
    jobs: list[JobRead]
    stats: JobStats


class JobQueueStats(BaseModel):
    total: int
    pending: int
    processing: int
    completed: int
    in_progress: int
    ready_for_review: int

    @classmethod
    def from_jobs(cls, jobs: Sequence[Any]) -> "JobQueueStats":
        counts = {"pending": 0, "processing": 0, "completed": 0}
        for job in jobs:
            status = _normalise_status(getattr(job, "status", None))
            if status in counts:
                counts[status] += 1
        in_progress = counts["pending"] + counts["processing"]
        ready_for_review = counts["completed"]
        return cls(
            total=len(jobs),
            pending=counts["pending"],
            processing=counts["processing"],
            completed=counts["completed"],
            in_progress=in_progress,
            ready_for_review=ready_for_review,
        )


class JobQueueResponse(BaseModel):
    jobs: list[JobRead]
    stats: JobQueueStats


class ReportCreate(BaseModel):
    transcript_id: Optional[int] = None
    format: str


class ReportRead(BaseModel):
    id: int
    transcript_id: Optional[int] = None
    format: str
    output_uri: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientBase(BaseModel):
    patient_identifier: str = Field(min_length=1)
    patient_name: str = Field(min_length=1)
    patient_date_of_birth: Optional[date] = None


class PatientCreate(PatientBase):
    pass


class PatientRead(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TranscriptionBase(BaseModel):
    doctor_specialty: Optional[str] = None
    transcript_text: str = Field(min_length=1)
    receptionist_id: Optional[int] = None


class TranscriptionCreate(TranscriptionBase, PatientBase):
    pass


class TranscriptionRead(TranscriptionBase):
    id: int
    patient: PatientRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

