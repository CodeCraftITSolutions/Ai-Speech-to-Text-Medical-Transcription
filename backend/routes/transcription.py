from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import Transcription
from schemas import TranscriptionOut
from asr_service import transcribe_audio
import shutil
import os

router = APIRouter()

@router.post("/transcribe", response_model=TranscriptionOut)
async def transcribe(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    contents = await file.read()
    text = transcribe_audio(contents)

    new_transcription = Transcription(
        user_id=user.id,
        audio_path=file.filename,
        transcript=text
    )
    db.add(new_transcription)
    db.commit()
    db.refresh(new_transcription)

    return new_transcription


@router.get("/history", response_model=list[TranscriptionOut])
def get_transcriptions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Transcription).filter(Transcription.user_id == user.id).all()