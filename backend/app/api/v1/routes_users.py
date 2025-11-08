from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.domain import repositories, schemas
from app.domain.models import UserRole
from app.infra import auth
from app.infra.db import get_db
from app.services import totp as totp_service

router = APIRouter(prefix="/v1/users", tags=["users"])


@router.get("/receptionists", response_model=list[schemas.UserListItem])
def list_receptionists(
    db: Session = Depends(get_db),
    _: object = Depends(auth.require_roles(UserRole.DOCTOR, UserRole.ADMIN)),
) -> list[schemas.UserListItem]:
    user_repo = repositories.UserRepository(db)
    receptionists = user_repo.list_by_role(UserRole.RECEPTIONIST.value)
    return [schemas.UserListItem.model_validate(user) for user in receptionists]


@router.patch("/me", response_model=schemas.UserRead)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.UserRead:
    user_repo = repositories.UserRepository(db)
    update_data = payload.model_dump(exclude_unset=True)

    sanitized: dict[str, object] = {}
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
            if not value:
                value = None
        sanitized[field] = value

    if "specialty" in sanitized and current_user.role != UserRole.DOCTOR.value:
        sanitized.pop("specialty")

    updated_user = user_repo.update(current_user, **sanitized)
    return schemas.UserRead.from_orm(updated_user)


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> Response:
    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if auth.verify_password(payload.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    user_repo = repositories.UserRepository(db)
    hashed = auth.hash_password(payload.new_password)
    user_repo.update(current_user, hashed_password=hashed)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/me/totp/setup", response_model=schemas.TOTPSetupResponse)
def initiate_totp_setup(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TOTPSetupResponse:
    if current_user.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Two-factor authentication is already enabled")

    secret = totp_service.generate_secret()
    user_repo = repositories.UserRepository(db)
    user_repo.update(current_user, totp_secret_pending=secret, totp_secret=None, totp_enabled=False)

    otpauth_url = totp_service.build_otpauth_url(secret, current_user.username)
    return schemas.TOTPSetupResponse(secret=secret, otpauth_url=otpauth_url)


@router.post("/me/totp/verify", response_model=schemas.TOTPStatus)
def verify_totp_setup(
    payload: schemas.TOTPVerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TOTPStatus:
    if current_user.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Two-factor authentication is already enabled")

    pending_secret = current_user.totp_secret_pending
    if not pending_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No pending two-factor authentication setup")

    if not totp_service.verify_code(pending_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid authentication code")

    user_repo = repositories.UserRepository(db)
    user_repo.update(
        current_user,
        totp_secret=pending_secret,
        totp_secret_pending=None,
        totp_enabled=True,
    )
    return schemas.TOTPStatus(enabled=True)


@router.post("/me/totp/disable", response_model=schemas.TOTPStatus)
def disable_totp(
    payload: schemas.TOTPDisableRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
) -> schemas.TOTPStatus:
    if not current_user.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Two-factor authentication is not enabled")

    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    user_repo = repositories.UserRepository(db)
    user_repo.update(
        current_user,
        totp_secret=None,
        totp_secret_pending=None,
        totp_enabled=False,
    )
    return schemas.TOTPStatus(enabled=False)
