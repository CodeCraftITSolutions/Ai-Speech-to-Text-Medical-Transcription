from fastapi import APIRouter, Depends, UploadFile

from app.domain.models import User
from app.infra import auth

router = APIRouter(prefix="/v1/transcribe", tags=["transcribe"])


@router.post("/upload")
async def upload_transcription(
    file: UploadFile,
    current_user: User = Depends(auth.get_current_user),
):
    # TODO: Forward audio to ASR pipeline implemented by AI team.
    return {"detail": "Transcription processing TODO", "filename": file.filename}


@router.websocket("/stream")
async def websocket_transcription(websocket):
    # TODO: Implement websocket streaming for live transcription.
    await websocket.close()

