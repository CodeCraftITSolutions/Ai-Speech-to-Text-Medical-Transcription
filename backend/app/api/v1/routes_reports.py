from fastapi import APIRouter, Depends, HTTPException, status

from app import deps
from app.domain import repositories, schemas
from app.domain.models import User, UserRole
from app.infra import auth
from app.infra.storage import storage_client
from app.services.reports.builder import ReportBuilder

router = APIRouter(prefix="/v1/reports", tags=["reports"])


@router.post("", response_model=schemas.ReportRead, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: schemas.ReportCreate,
    current_user: User = Depends(auth.require_roles(UserRole.DOCTOR, UserRole.ADMIN)),
    report_repo: repositories.ReportRepository = Depends(deps.get_report_repository),
):
    builder = ReportBuilder(format=report_in.format)
    key, _ = builder.generate(report_in)
    report = report_repo.create(report_in, key)
    return schemas.ReportRead.from_orm(report)


@router.get("/{report_id}")
def get_report(
    report_id: int,
    current_user: User = Depends(auth.require_roles(UserRole.DOCTOR, UserRole.ADMIN)),
    report_repo: repositories.ReportRepository = Depends(deps.get_report_repository),
):
    report = report_repo.get(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    url = storage_client.get_signed_url(report.output_uri)
    return {"url": url, "report": schemas.ReportRead.from_orm(report)}

