from datetime import datetime
import secrets
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.domain import repositories, schemas
from app.infra import auth, two_factor
from app.infra.db import get_db
from app.settings import get_settings

settings = get_settings()

router = APIRouter(prefix="/v1/users", tags=["users"])


@router.patch("/me", response_model=schemas.UserRead)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.UserRead:
    user_repo = repositories.UserRepository(db)
    update_data = payload.model_dump(exclude_unset=True)

    sanitized: dict[str, Any] = {}
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
            if not value:
                value = None
        sanitized[field] = value

    updated_user = user_repo.update(current_user, **sanitized)
    user_read = schemas.UserRead.from_orm(updated_user)
    if updated_user.two_factor_enabled:
        user_read = user_read.model_copy(update={"two_factor_method": "totp"})
    return user_read


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> Response:
    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    user_repo = repositories.UserRepository(db)
    hashed_password = auth.hash_password(payload.new_password)
    user_repo.update(current_user, hashed_password=hashed_password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _two_factor_status(user) -> schemas.TwoFactorStatus:
    enabled = bool(user.two_factor_enabled and user.two_factor_shared_secret)
    return schemas.TwoFactorStatus(
        enabled=enabled,
        confirmed=bool(user.two_factor_confirmed_at),
        method="totp" if enabled else None,
    )


@router.post(
    "/me/security/start-two-factor",
    response_model=schemas.TwoFactorEnrollmentStart,
)
def start_two_factor_enrollment(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TwoFactorEnrollmentStart:
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is already enabled.",
        )

    secret = two_factor.generate_totp_secret()
    challenge_id = secrets.token_urlsafe(24)
    expires_at = two_factor.enrollment_deadline()
    expires_in = max(1, int((expires_at - datetime.utcnow()).total_seconds()))

    user_repo = repositories.UserRepository(db)
    updated = user_repo.update(
        current_user,
        two_factor_shared_secret=secret,
        two_factor_challenge_token=challenge_id,
        two_factor_challenge_expires_at=expires_at,
        two_factor_enabled=False,
        two_factor_confirmed_at=None,
    )

    provisioning_uri = two_factor.provisioning_uri(
        secret, updated.username, settings.APP_NAME
    )
    debug_code = (
        two_factor.active_debug_code(secret)
        if settings.ENV.lower() != "production"
        else None
    )

    return schemas.TwoFactorEnrollmentStart(
        challenge_id=challenge_id,
        secret=secret,
        provisioning_uri=provisioning_uri,
        expires_in_seconds=expires_in,
        debug_code=debug_code,
    )


@router.post(
    "/me/security/enable-two-factor",
    response_model=schemas.TwoFactorStatus,
)
def enable_two_factor(
    payload: schemas.TwoFactorEnableRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TwoFactorStatus:
    if (
        not current_user.two_factor_challenge_token
        or not current_user.two_factor_shared_secret
        or not current_user.two_factor_challenge_expires_at
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active two-factor enrollment. Start again to continue.",
        )

    if payload.challenge_id != current_user.two_factor_challenge_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification challenge.",
        )

    if current_user.two_factor_challenge_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor enrollment has expired. Start again.",
        )

    if not two_factor.verify_totp(payload.code, current_user.two_factor_shared_secret):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    user_repo = repositories.UserRepository(db)
    updated = user_repo.update(
        current_user,
        two_factor_enabled=True,
        two_factor_confirmed_at=datetime.utcnow(),
        two_factor_challenge_token=None,
        two_factor_challenge_expires_at=None,
    )
    return _two_factor_status(updated)


@router.post(
    "/me/security/disable-two-factor",
    response_model=schemas.TwoFactorStatus,
)
def disable_two_factor(
    payload: schemas.TwoFactorDisableRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TwoFactorStatus:
    if not current_user.two_factor_enabled:
        return _two_factor_status(current_user)

    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    user_repo = repositories.UserRepository(db)
    updated = user_repo.update(
        current_user,
        two_factor_enabled=False,
        two_factor_confirmed_at=None,
        two_factor_shared_secret=None,
        two_factor_challenge_token=None,
        two_factor_challenge_expires_at=None,
    )
    return _two_factor_status(updated)
