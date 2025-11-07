import logging
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.domain.models import User
from app.services.asr.whisper_service import WhisperService
from app.infra import auth
from app import deps

router = APIRouter(prefix="/v1/transcribe", tags=["transcribe"])

logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_transcription(
    file: UploadFile,
    current_user: User = Depends(auth.get_current_user),
    whisper_service: WhisperService = Depends(deps.get_whisper_service),
):
    suffix = Path(file.filename or "recording").suffix or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        written_bytes = 0
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            temp_file.write(chunk)
            written_bytes += len(chunk)

    if written_bytes == 0:
        try:
            os.remove(temp_path)
        except OSError:
            logger.warning("Failed to remove empty temporary file: %s", temp_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    try:
        transcript = await run_in_threadpool(
            whisper_service.transcribe,
            temp_path,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to transcribe audio file: %s", file.filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to transcribe audio",
        ) from exc
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            logger.warning("Failed to remove temporary file: %s", temp_path)

    return {
        "detail": "Transcription completed",
        "filename": file.filename,
        "transcript": transcript,
    }


@router.websocket("/stream")
async def websocket_transcription(websocket):
    # TODO: Implement websocket streaming for live transcription.
    await websocket.close()

