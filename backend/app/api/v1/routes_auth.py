from datetime import datetime
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.infra.db import get_db
from app.domain import repositories, schemas
from app.domain.models import UserRole
from app.infra import auth, two_factor
from app.settings import get_settings

settings = get_settings()

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


@router.post("/login", response_model=schemas.LoginResponse)
def login(
    payload: schemas.LoginRequest,
    response: Response = None,
    db: Session = Depends(get_db),
) -> schemas.LoginResponse:
    response = response or Response()
    user_repo = repositories.UserRepository(db)
    username = getattr(payload, "username", None)
    password = getattr(payload, "password", None)
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    user = user_repo.get_by_username(username)
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.two_factor_enabled and user.two_factor_shared_secret:
        challenge_id = secrets.token_urlsafe(24)
        expires_at = two_factor.login_challenge_deadline()
        expires_in = max(1, int((expires_at - datetime.utcnow()).total_seconds()))

        user_repo.update(
            user,
            two_factor_challenge_token=challenge_id,
            two_factor_challenge_expires_at=expires_at,
        )

        debug_code = (
            two_factor.active_debug_code(user.two_factor_shared_secret)
            if settings.ENV.lower() != "production"
            else None
        )
        return schemas.LoginTwoFactorChallenge(
            challenge_id=challenge_id,
            method="totp",
            expires_in_seconds=expires_in,
            debug_code=debug_code,
        )

    access_token = auth.create_access_token(subject=user.id)
    refresh_token = auth.create_refresh_token(subject=user.id)
    auth.set_refresh_cookie(response, refresh_token)
    return schemas.LoginSuccess(access_token=access_token)


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


@router.post("/login/verify", response_model=schemas.Token)
def verify_two_factor_login(
    payload: schemas.TwoFactorLoginVerifyRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> schemas.Token:
    user_repo = repositories.UserRepository(db)
    user = user_repo.get_by_two_factor_challenge(payload.challenge_id)
    if (
        not user
        or not user.two_factor_enabled
        or not user.two_factor_shared_secret
        or not user.two_factor_challenge_token
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired two-factor challenge.",
        )

    if (
        not user.two_factor_challenge_expires_at
        or user.two_factor_challenge_expires_at < datetime.utcnow()
    ):
        user_repo.update(
            user,
            two_factor_challenge_token=None,
            two_factor_challenge_expires_at=None,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor verification has expired. Start again.",
        )

    if not two_factor.verify_totp(payload.code, user.two_factor_shared_secret):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    updated_user = user_repo.update(
        user,
        two_factor_challenge_token=None,
        two_factor_challenge_expires_at=None,
    )

    access_token = auth.create_access_token(subject=updated_user.id)
    refresh_token = auth.create_refresh_token(subject=updated_user.id)
    auth.set_refresh_cookie(response, refresh_token)
    return schemas.Token(access_token=access_token)


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

