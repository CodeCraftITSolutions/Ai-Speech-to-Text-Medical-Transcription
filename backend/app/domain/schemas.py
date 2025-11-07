from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None


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
    totp_enabled: bool = False

    model_config = ConfigDict(from_attributes=True)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class TOTPSetupResponse(BaseModel):
    secret: str
    otpauth_url: str


class TOTPVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=8)


class TOTPDisableRequest(BaseModel):
    current_password: str = Field(min_length=1)


class TOTPStatus(BaseModel):
    enabled: bool


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

