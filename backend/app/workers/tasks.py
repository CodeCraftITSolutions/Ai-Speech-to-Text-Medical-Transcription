from __future__ import annotations

from typing import Any, Dict

from app.domain import repositories, schemas
from app.domain.models import JobStatus
from app.infra import storage
from app.infra.db import session_scope


def transcribe_batch(job_id: int, payload: Dict[str, Any]) -> None:
    """Background task to process transcription batches.

    Actual ASR pipeline is handled by the AI team.
    """
    with session_scope() as session:
        job_repo = repositories.JobRepository(session)
        job_repo.update_status(job_id, JobStatus.PROCESSING.value)

        # TODO: Integrate with ASR service (whisper, wav2vec, etc.) once available.
        # This placeholder simulates output storage key.
        output_key = f"jobs/{job_id}/transcript.txt"
        storage.storage_client.put_bytes(output_key, b"TODO: transcript content", "text/plain")

        job_repo.update_status(job_id, JobStatus.COMPLETED.value, output_uri=output_key)


def report_build(job_id: int, report_payload: Dict[str, Any]) -> None:
    with session_scope() as session:
        job_repo = repositories.JobRepository(session)
        job_repo.update_status(job_id, JobStatus.PROCESSING.value)

        builder = report_payload["builder"]
        report_in: schemas.ReportCreate = report_payload["report_in"]
        report_repo = repositories.ReportRepository(session)

        output_key, _ = builder.generate(report_in)
        report_repo.create(report_in, output_key)

        job_repo.update_status(job_id, JobStatus.COMPLETED.value, output_uri=output_key)

