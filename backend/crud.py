from sqlalchemy.orm import Session
from models import User, Transcription
from schemas import UserCreate
from auth import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_transcriptions_by_user(db: Session, user_id: int):
    return db.query(Transcription).filter(Transcription.user_id == user_id).all()