from sqlalchemy.orm import Session

from app.api.v1 import routes_reports
from app.domain import repositories, schemas
from app.infra import auth


def test_create_and_fetch_report(db_session: Session, monkeypatch) -> None:
    user_repo = repositories.UserRepository(db_session)
    doctor = user_repo.create("dr-report", auth.hash_password("securepass"), "doctor")

    stored = {}

    def fake_put_bytes(key: str, data: bytes, content_type: str | None = None) -> str:
        stored[key] = data
        return key

    def fake_get_signed_url(key: str, expires_in: int = 3600) -> str:
        return f"https://example.com/{key}"

    from app.infra import storage
    monkeypatch.setattr(storage.storage_client, 'put_bytes', fake_put_bytes, raising=False)
    monkeypatch.setattr(storage.storage_client, 'get_signed_url', fake_get_signed_url, raising=False)

    report_repo = repositories.ReportRepository(db_session)
    report_in = schemas.ReportCreate(transcript_id=1, format="pdf")
    report = routes_reports.create_report(report_in, current_user=doctor, report_repo=report_repo)
    assert report.format == "pdf"

    result = routes_reports.get_report(report.id, current_user=doctor, report_repo=report_repo)
    assert "url" in result
    assert result["report"].id == report.id

