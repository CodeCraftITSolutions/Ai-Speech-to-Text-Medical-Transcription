import types

from sqlalchemy.orm import Session

from app.api.v1 import routes_jobs
from app.domain import repositories, schemas
from app.infra import auth


def test_create_and_get_job(db_session: Session, monkeypatch) -> None:
    user_repo = repositories.UserRepository(db_session)
    user_db = user_repo.create("clinician", auth.hash_password("securepass"), "doctor")

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
    assert dummy_queue.enqueued

    jobs = routes_jobs.list_jobs(current_user=user_db, job_repo=job_repo)
    assert len(jobs) == 1

    job_detail = routes_jobs.get_job(job_read.id, current_user=user_db, job_repo=job_repo)
    assert job_detail.id == job_read.id

