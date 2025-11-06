from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1 import routes_auth
from app.domain import schemas
from app.infra import auth


def test_register_and_login(db_session: Session) -> None:
    payload = schemas.UserCreate(username="doctor", password="securepass", role="doctor")
    user = routes_auth.register(payload, db=db_session)
    assert user.username == "doctor"

    form = OAuth2PasswordRequestForm(username="doctor", password="securepass", scope="")
    token_response = routes_auth.login(form, db=db_session)
    assert token_response.access_token

    current_user = auth.get_current_user(db=db_session, token=token_response.access_token)
    assert current_user.username == "doctor"

