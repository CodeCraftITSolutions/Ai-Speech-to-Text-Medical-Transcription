import types
from collections import Counter

from sqlalchemy.orm import Session

from app.api.v1 import routes_jobs
from app.domain import repositories, schemas
from app.domain.models import JobStatus, UserRole
from app.infra import auth


def test_create_and_get_job(db_session: Session, monkeypatch) -> None:
    user_repo = repositories.UserRepository(db_session)
    user_db = user_repo.create(
        "clinician",
        auth.hash_password("securepass"),
        "doctor",
        specialty="Cardiology",
    )

    dummy_queue = types.SimpleNamespace(enqueued=[])  # type: ignore[attr-defined]

    def fake_queue(name: str = "default"):
        class DummyQueue:
            def enqueue(self, *args, **kwargs):
                dummy_queue.enqueued.append((args, kwargs))

        return DummyQueue()

    monkeypatch.setattr("app.api.v1.routes_jobs.get_queue", fake_queue)

    job_repo = repositories.JobRepository(db_session)
    job_in = schemas.JobCreate(type="transcription", input_uri="s3://bucket/audio.wav")
    job_read = routes_jobs.create_job(job_in, current_user=user_db, job_repo=job_repo)
    assert job_read.type == "transcription"
    assert job_read.created_by_id == user_db.id
    assert dummy_queue.enqueued

    jobs = routes_jobs.list_jobs(current_user=user_db, job_repo=job_repo)
    assert len(jobs) == 1

    job_detail = routes_jobs.get_job(job_read.id, current_user=user_db, job_repo=job_repo)
    assert job_detail.id == job_read.id
    assert job_detail.created_by_id == user_db.id


def test_job_history_stats(db_session: Session) -> None:
    user_repo = repositories.UserRepository(db_session)
    user_db = user_repo.create(
        "clinician-history",
        auth.hash_password("securepass"),
        "doctor",
    )

    job_repo = repositories.JobRepository(db_session)
    job_processing = job_repo.create(
        created_by_id=user_db.id,
        job_in=schemas.JobCreate(type="transcription"),
    )
    job_completed = job_repo.create(
        created_by_id=user_db.id,
        job_in=schemas.JobCreate(type="transcription", input_uri="s3://bucket/audio.wav"),
    )
    job_failed = job_repo.create(
        created_by_id=user_db.id,
        job_in=schemas.JobCreate(type="transcription"),
    )

    job_repo.update_status(job_processing.id, JobStatus.PROCESSING.value)
    job_repo.update_status(
        job_completed.id,
        JobStatus.COMPLETED.value,
        output_uri="s3://bucket/result.txt",
    )
    job_repo.update_status(job_failed.id, JobStatus.FAILED.value)

    history = routes_jobs.get_job_history(current_user=user_db, job_repo=job_repo)

    assert history.stats.total == 3
    assert history.stats.processing == 1
    assert history.stats.completed == 1
    assert history.stats.failed == 1
    assert history.stats.in_queue == 1
    assert history.stats.ready_for_review == 1
    assert history.stats.unknown == 0
    assert len(history.jobs) == 3

    returned_statuses = Counter(job.status for job in history.jobs)
    assert returned_statuses[JobStatus.PROCESSING.value] == 1
    assert returned_statuses[JobStatus.COMPLETED.value] == 1
    assert returned_statuses[JobStatus.FAILED.value] == 1


def test_review_queue_filters_statuses(db_session: Session) -> None:
    user_repo = repositories.UserRepository(db_session)
    user_db = user_repo.create(
        "clinician-review",
        auth.hash_password("securepass"),
        "doctor",
    )

    job_repo = repositories.JobRepository(db_session)
    job_pending = job_repo.create(
        created_by_id=user_db.id, job_in=schemas.JobCreate(type="transcription")
    )
    job_processing = job_repo.create(
        created_by_id=user_db.id, job_in=schemas.JobCreate(type="transcription")
    )
    job_completed = job_repo.create(
        created_by_id=user_db.id, job_in=schemas.JobCreate(type="transcription")
    )
    job_failed = job_repo.create(
        created_by_id=user_db.id, job_in=schemas.JobCreate(type="transcription")
    )

    job_repo.update_status(job_processing.id, JobStatus.PROCESSING.value)
    job_repo.update_status(job_completed.id, JobStatus.COMPLETED.value)
    job_repo.update_status(job_failed.id, JobStatus.FAILED.value)

    queue = routes_jobs.get_review_queue(current_user=user_db, job_repo=job_repo)

    assert len(queue.jobs) == 3
    assert {job.id for job in queue.jobs} == {
        job_pending.id,
        job_processing.id,
        job_completed.id,
    }
    assert queue.stats.total == 3
    assert queue.stats.pending == 1
    assert queue.stats.processing == 1
    assert queue.stats.completed == 1
    assert queue.stats.in_progress == 2
    assert queue.stats.ready_for_review == 1


def test_jobs_visible_to_assignee(db_session: Session) -> None:
    user_repo = repositories.UserRepository(db_session)
    doctor = user_repo.create(
        "doctor-owner",
        auth.hash_password("securepass"),
        UserRole.DOCTOR.value,
    )
    receptionist = user_repo.create(
        "assistant-user",
        auth.hash_password("securepass"),
        UserRole.RECEPTIONIST.value,
    )

    patient_repo = repositories.PatientRepository(db_session)
    patient = patient_repo.create(
        patient_identifier="PAT-001",
        patient_name="Alice Patient",
    )
    transcription_repo = repositories.TranscriptionRepository(db_session)
    transcription = transcription_repo.create(
        patient_id=patient.id,
        doctor_specialty="cardiology",
        transcript_text="Example transcript",
        receptionist_id=receptionist.id,
    )

    job_repo = repositories.JobRepository(db_session)
    job = job_repo.create(
        created_by_id=doctor.id,
        job_in=schemas.JobCreate(
            type="transcription",
            transcription_id=transcription.id,
            assignee_id=receptionist.id,
        ),
    )

    jobs_for_assignee = job_repo.list_for_user(receptionist.id)
    assert {item.id for item in jobs_for_assignee} == {job.id}

    retrieved = routes_jobs.get_job(job.id, current_user=receptionist, job_repo=job_repo)
    assert retrieved.id == job.id
    assert retrieved.assignee_id == receptionist.id

