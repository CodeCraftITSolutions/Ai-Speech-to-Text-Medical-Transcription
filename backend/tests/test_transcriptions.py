from datetime import date

from app.domain import repositories
from app.domain.models import UserRole


def test_create_transcription_with_patient_and_receptionist(db_session):
    user_repo = repositories.UserRepository(db_session)
    patient_repo = repositories.PatientRepository(db_session)
    transcription_repo = repositories.TranscriptionRepository(db_session)

    receptionist = user_repo.create(
        username="receptionist1",
        hashed_password="hashed-password",
        role=UserRole.RECEPTIONIST.value,
    )

    patient = patient_repo.create(
        patient_identifier="PAT-123",
        patient_name="John Doe",
        patient_date_of_birth=date(1985, 5, 20),
    )

    transcription = transcription_repo.create(
        patient_id=patient.id,
        doctor_specialty="cardiology",
        transcript_text="Patient is recovering well.",
        receptionist_id=receptionist.id,
    )

    assert transcription.patient_id == patient.id
    assert transcription.receptionist_id == receptionist.id
    assert transcription.transcript_text == "Patient is recovering well."
    assert transcription.patient.patient_name == "John Doe"
    assert transcription.patient.patient_identifier == "PAT-123"


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

    user_repo.create("doc", "hashed", UserRole.DOCTOR.value)
    user_repo.create("rec-1", "hashed", UserRole.RECEPTIONIST.value)
    user_repo.create("rec-2", "hashed", UserRole.RECEPTIONIST.value)

    receptionists = user_repo.list_by_role(UserRole.RECEPTIONIST.value)

    assert len(receptionists) == 2
    assert {user.username for user in receptionists} == {"rec-1", "rec-2"}
