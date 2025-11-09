from datetime import date

from app.api.v1 import routes_transcriptions
from app.domain import repositories, schemas
from app.domain.models import UserRole
from app.infra import auth


def test_create_transcription_with_patient_and_receptionist(db_session):
    user_repo = repositories.UserRepository(db_session)
    patient_repo = repositories.PatientRepository(db_session)

    doctor = user_repo.create(
        username="doctor1",
        hashed_password=auth.hash_password("doctorpass"),
        role=UserRole.DOCTOR.value,
    )
    receptionist = user_repo.create(
        username="receptionist1",
        hashed_password=auth.hash_password("assistantpass"),
        role=UserRole.RECEPTIONIST.value,
    )

    payload = schemas.TranscriptionCreate(
        patient_identifier="PAT-123",
        patient_name="John Doe",
        patient_date_of_birth=date(1985, 5, 20),
        doctor_specialty="cardiology",
        transcript_text="Patient is recovering well.",
        receptionist_id=receptionist.id,
    )

    transcription = routes_transcriptions.create_transcription(
        payload,
        db=db_session,
        current_user=doctor,
    )

    assert transcription.patient.patient_name == "John Doe"
    assert transcription.patient.patient_identifier == "PAT-123"
    assert transcription.receptionist_id == receptionist.id
    assert transcription.transcript_text == "Patient is recovering well."

    stored_patient = patient_repo.get_by_identifier("PAT-123")
    assert stored_patient is not None
    assert stored_patient.patient_name == "John Doe"

    job_repo = repositories.JobRepository(db_session)
    doctor_jobs = job_repo.list_for_user(doctor.id)
    assert len(doctor_jobs) == 1
    job = doctor_jobs[0]
    assert job.transcription_id == transcription.id
    assert job.assignee_id == receptionist.id

    receptionist_jobs = job_repo.list_for_user(receptionist.id)
    assert {item.id for item in receptionist_jobs} == {job.id}


def test_patient_repository_get_by_identifier(db_session):
    patient_repo = repositories.PatientRepository(db_session)

    patient_repo.create(
        patient_identifier="PAT-456",
        patient_name="Jane Smith",
        patient_date_of_birth=None,
    )

    stored = patient_repo.get_by_identifier("PAT-456")
    assert stored is not None
    assert stored.patient_name == "Jane Smith"
    assert stored.patient_identifier == "PAT-456"


def test_user_repository_list_by_role(db_session):
    user_repo = repositories.UserRepository(db_session)

    doctor = user_repo.create("doc", "hashed", UserRole.DOCTOR.value, specialty="Cardiology")
    user_repo.create("rec-1", "hashed", UserRole.RECEPTIONIST.value)
    user_repo.create("rec-2", "hashed", UserRole.RECEPTIONIST.value)

    assert doctor.specialty == "Cardiology"

    receptionists = user_repo.list_by_role(UserRole.RECEPTIONIST.value)

    assert len(receptionists) == 2
    assert {user.username for user in receptionists} == {"rec-1", "rec-2"}
