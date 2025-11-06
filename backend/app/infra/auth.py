from datetime import datetime, timedelta
import hashlib
import secrets
from typing import Iterable

from fastapi import Depends, HTTPException, Response, params, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.domain import repositories
from app.domain.models import User, UserRole
from app.domain.schemas import TokenPayload
from app.infra.db import get_db
from app.settings import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

FALLBACK_PREFIX = "sha256$"


def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        digest = hashlib.sha256(password.encode()).hexdigest()
        return f"{FALLBACK_PREFIX}{digest}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith(FALLBACK_PREFIX):
        expected = hashed_password[len(FALLBACK_PREFIX) :]
        return secrets.compare_digest(hashlib.sha256(plain_password.encode()).hexdigest(), expected)
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def _create_token(*, subject: int, expires_delta: timedelta, token_type: str) -> str:
    now = datetime.utcnow()
    expire = now + expires_delta
    to_encode = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALG)


def create_access_token(*, subject: int, expires_delta: timedelta | None = None) -> str:
    lifetime = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(subject=subject, expires_delta=lifetime, token_type="access")


def create_refresh_token(*, subject: int, expires_delta: timedelta | None = None) -> str:
    lifetime = expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_token(subject=subject, expires_delta=lifetime, token_type="refresh")


def _decode_token(token: str, expected_type: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALG])
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc

    token_type = payload.get("type")
    subject = payload.get("sub")
    exp = payload.get("exp")

    if token_type != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    try:
        subject_id = int(subject)
        exp_value = int(exp)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc

    return TokenPayload(sub=subject_id, exp=exp_value, type=token_type)


def decode_access_token(token: str) -> TokenPayload:
    return _decode_token(token, expected_type="access")


def decode_refresh_token(token: str) -> TokenPayload:
    return _decode_token(token, expected_type="refresh")


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite="strict",
    )


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    token: str | None = None,
) -> User:
    raw_token: str | None = None
    direct_call = isinstance(credentials, params.Depends)

    if token is not None and direct_call:
        raw_token = token

    if raw_token is None and isinstance(credentials, HTTPAuthorizationCredentials):
        raw_token = credentials.credentials

    if raw_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(raw_token)
    user = repositories.UserRepository(db).get(payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user


def require_roles(*roles: Iterable[UserRole]):
    role_values = {role.value if isinstance(role, UserRole) else role for role in roles}

    def dependency(user: User = Depends(get_current_user)) -> User:
        if role_values and user.role not in role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return dependency


__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_access_token",
    "decode_refresh_token",
    "set_refresh_cookie",
    "clear_refresh_cookie",
    "get_current_user",
    "require_roles",
]
