from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from typing import Tuple

from app.domain.schemas import ReportCreate
from app.infra.storage import storage_client


@dataclass
class ReportBuilder:
    format: str = "pdf"

    def generate(self, report_in: ReportCreate) -> Tuple[str, str]:
        """Build a report artifact and upload to storage."""
        key = f"reports/{uuid.uuid4()}.{report_in.format}"
        payload = {
            "transcript_id": report_in.transcript_id,
            "format": report_in.format,
            "content": "TODO: populate with structured report data",
        }
        storage_client.put_bytes(key, json.dumps(payload).encode("utf-8"), "application/json")
        url = storage_client.get_signed_url(key)
        return key, url

