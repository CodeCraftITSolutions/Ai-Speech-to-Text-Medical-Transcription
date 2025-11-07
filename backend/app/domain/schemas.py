from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenPayload(BaseModel):
    sub: int
    exp: int
    type: str


class UserBase(BaseModel):
    username: str
    role: str = Field(default="assistant")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    two_factor_enabled: bool = False
    two_factor_confirmed: bool = False
    two_factor_method: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class TwoFactorEnrollmentStart(BaseModel):
    challenge_id: str
    secret: str
    provisioning_uri: str
    expires_in_seconds: int = 600
    debug_code: Optional[str] = None


class TwoFactorEnableRequest(BaseModel):
    challenge_id: str
    code: str = Field(min_length=4, max_length=8)


class TwoFactorDisableRequest(BaseModel):
    current_password: str = Field(min_length=8)


class TwoFactorStatus(BaseModel):
    enabled: bool
    confirmed: bool
    method: Optional[str] = None


class LoginTwoFactorChallenge(BaseModel):
    requires_two_factor: Literal[True] = True
    challenge_id: str
    method: Literal["totp"] = "totp"
    expires_in_seconds: int = 300
    debug_code: Optional[str] = None


class LoginSuccess(Token):
    requires_two_factor: Literal[False] = False


LoginResponse = LoginSuccess | LoginTwoFactorChallenge


class TwoFactorLoginVerifyRequest(BaseModel):
    challenge_id: str
    code: str = Field(min_length=4, max_length=8)


class JobBase(BaseModel):
    type: str
    input_uri: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobRead(JobBase):
    id: int
    status: str
    output_uri: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    transcript_id: Optional[int] = None
    format: str


class ReportRead(BaseModel):
    id: int
    transcript_id: Optional[int] = None
    format: str
    output_uri: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

