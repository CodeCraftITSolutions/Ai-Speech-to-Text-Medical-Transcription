from fastapi import APIRouter, Depends, HTTPException, status

from app import deps
from app.domain import repositories, schemas
from app.domain.models import User
from app.infra import auth
from app.infra.broker import get_queue
from app.workers import tasks

router = APIRouter(prefix="/v1/jobs", tags=["jobs"])


@router.post("", response_model=schemas.JobRead, status_code=status.HTTP_202_ACCEPTED)
def create_job(
    job_in: schemas.JobCreate,
    current_user: User = Depends(auth.get_current_user),
    job_repo: repositories.JobRepository = Depends(deps.get_job_repository),
):
    job = job_repo.create(current_user.id, job_in)
    queue = get_queue()
    queue.enqueue(tasks.transcribe_batch, job.id, {"input_uri": job_in.input_uri})
    return schemas.JobRead.from_orm(job)


@router.get("", response_model=list[schemas.JobRead])
def list_jobs(
    current_user: User = Depends(auth.get_current_user),
    job_repo: repositories.JobRepository = Depends(deps.get_job_repository),
):
    jobs = job_repo.list_for_user(current_user.id)
    return [schemas.JobRead.from_orm(job) for job in jobs]


@router.get("/{job_id}", response_model=schemas.JobRead)
def get_job(
    job_id: int,
    current_user: User = Depends(auth.get_current_user),
    job_repo: repositories.JobRepository = Depends(deps.get_job_repository),
):
    job = job_repo.get(job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return schemas.JobRead.from_orm(job)

