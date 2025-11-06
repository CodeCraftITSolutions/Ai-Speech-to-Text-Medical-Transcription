from datetime import datetime, timedelta
import hashlib
import secrets
from typing import Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.domain import repositories
from app.domain.models import User, UserRole
from app.domain.schemas import TokenPayload
from app.infra.db import get_db
from app.settings import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")

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


def create_access_token(*, subject: int, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALG)


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALG])
        return TokenPayload(sub=int(payload.get("sub")), exp=payload.get("exp"))
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_access_token(token)
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
    "decode_access_token",
    "get_current_user",
    "require_roles",
]
