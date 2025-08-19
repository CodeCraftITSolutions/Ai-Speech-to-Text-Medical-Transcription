# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ----- User Schemas -----

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

# ----- Transcription Schemas -----

class TranscriptionBase(BaseModel):
    transcript: str
    audio_path: Optional[str] = None

class TranscriptionCreate(TranscriptionBase):
    pass

class TranscriptionOut(TranscriptionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
