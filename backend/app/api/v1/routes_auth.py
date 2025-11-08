from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.infra.db import get_db
from app.domain import repositories, schemas
from app.domain.models import UserRole
from app.infra import auth
from app.services import totp as totp_service

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
    specialty = payload.specialty.strip() if payload.specialty else None
    if role_value != UserRole.DOCTOR.value:
        specialty = None

    user = user_repo.create(
        payload.username,
        hashed,
        role_value,
        specialty=specialty,
    )
    return schemas.UserRead.from_orm(user)


@router.post("/login", response_model=schemas.Token)
def login(
    payload: schemas.LoginRequest,
    response: Response = None,
    db: Session = Depends(get_db),
) -> schemas.Token:
    response = response or Response()
    user_repo = repositories.UserRepository(db)
    username = getattr(payload, "username", None)
    password = getattr(payload, "password", None)
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    user = user_repo.get_by_username(username)
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.totp_enabled:
        code = getattr(payload, "totp_code", None)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Two-factor authentication required", "totp_required": True},
            )
        if not totp_service.verify_code(user.totp_secret or "", code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid two-factor authentication code",
            )

    access_token = auth.create_access_token(subject=user.id)
    refresh_token = auth.create_refresh_token(subject=user.id)
    auth.set_refresh_cookie(response, refresh_token)
    return schemas.Token(access_token=access_token)


@router.get("/me", response_model=schemas.UserRead)
def me(current_user=Depends(auth.get_current_user)) -> schemas.UserRead:
    return schemas.UserRead.from_orm(current_user)


@router.post("/refresh", response_model=schemas.Token)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> schemas.Token:
    refresh_cookie = request.cookies.get(auth.settings.REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = auth.decode_refresh_token(refresh_cookie)
    user_repo = repositories.UserRepository(db)
    user = user_repo.get(payload.sub)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    new_access_token = auth.create_access_token(subject=user.id)
    new_refresh_token = auth.create_refresh_token(subject=user.id)
    auth.set_refresh_cookie(response, new_refresh_token)
    return schemas.Token(access_token=new_access_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request) -> JSONResponse:
    resp = JSONResponse({"ok": True})
    # If you set the cookie with a domain, compute the same domain here:
    # e.g., domain = request.headers.get("host").split(":")[0]
    auth.clear_refresh_cookie(resp)  # pass the domain you used when setting
    return resp


@router.get("/protected")
def protected_route(current_user=Depends(auth.get_current_user)) -> dict[str, object]:
    return {
        "message": "Authenticated request successful",
        "user": schemas.UserRead.from_orm(current_user),
    }

