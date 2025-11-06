from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.infra.db import get_db
from app.domain import repositories, schemas
from app.domain.models import UserRole
from app.infra import auth

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
) -> schemas.UserRead:
    user_repo = repositories.UserRepository(db)
    existing = user_repo.get_by_username(payload.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed = auth.hash_password(payload.password)
    try:
        role_value = UserRole(payload.role).value
    except ValueError as exc:
        raise HTTPException(status_code=400, detail='Invalid role') from exc
    user = user_repo.create(payload.username, hashed, role_value)
    return schemas.UserRead.from_orm(user)


@router.post("/token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> schemas.Token:
    user_repo = repositories.UserRepository(db)
    user = user_repo.get_by_username(form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = auth.create_access_token(subject=user.id)
    return schemas.Token(access_token=access_token)


@router.get("/me", response_model=schemas.UserRead)
def me(current_user=Depends(auth.get_current_user)) -> schemas.UserRead:
    return schemas.UserRead.from_orm(current_user)


@router.post("/logout")
def logout():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="TODO: Implement logout")

