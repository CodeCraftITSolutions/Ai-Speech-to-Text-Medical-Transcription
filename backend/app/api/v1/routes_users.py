from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain import repositories, schemas
from app.infra import auth
from app.infra.db import get_db

router = APIRouter(prefix="/v1/users", tags=["users"])


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

    updated_user = user_repo.update(current_user, **sanitized)
    return schemas.UserRead.from_orm(updated_user)
