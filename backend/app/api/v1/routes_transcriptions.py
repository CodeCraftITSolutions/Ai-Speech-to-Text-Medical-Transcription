from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domain import repositories, schemas
from app.domain.models import User, UserRole
from app.infra import auth
from app.infra.db import get_db

router = APIRouter(prefix="/v1/transcriptions", tags=["transcriptions"])


@router.post("", response_model=schemas.TranscriptionRead, status_code=status.HTTP_201_CREATED)
def create_transcription(
    payload: schemas.TranscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_roles(UserRole.DOCTOR, UserRole.ADMIN)),
) -> schemas.TranscriptionRead:
    patient_identifier = payload.patient_identifier.strip()
    patient_name = payload.patient_name.strip()
    transcript_text = payload.transcript_text.strip()

    if not patient_identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient identifier is required")
    if not patient_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient name is required")
    if not transcript_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transcript text is required")

    patient_repo = repositories.PatientRepository(db)
    transcription_repo = repositories.TranscriptionRepository(db)
    user_repo = repositories.UserRepository(db)
    job_repo = repositories.JobRepository(db)

    patient = patient_repo.get_by_identifier(patient_identifier)
    if patient:
        patient = patient_repo.update(
            patient,
            patient_name=patient_name,
            patient_date_of_birth=payload.patient_date_of_birth,
        )
    else:
        patient = patient_repo.create(
            patient_identifier=patient_identifier,
            patient_name=patient_name,
            patient_date_of_birth=payload.patient_date_of_birth,
        )

    receptionist_id = payload.receptionist_id
    if receptionist_id is not None:
        receptionist = user_repo.get(receptionist_id)
        if receptionist is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected receptionist does not exist")
        if receptionist.role != UserRole.TRANSCRIPTIONIST.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected user is not a receptionist")

    doctor_specialty = payload.doctor_specialty.strip() if payload.doctor_specialty else None

    transcription = transcription_repo.create(
        patient_id=patient.id,
        doctor_specialty=doctor_specialty,
        transcript_text=transcript_text,
        receptionist_id=receptionist_id,
    )

    job_repo.create(
        created_by_id=current_user.id,
        job_in=schemas.JobCreate(
            type="transcription",
            transcription_id=transcription.id,
            assignee_id=receptionist_id,
        ),
    )

    return schemas.TranscriptionRead.model_validate(transcription)
