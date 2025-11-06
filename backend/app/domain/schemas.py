from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int
    exp: int


class UserBase(BaseModel):
    username: str
    role: str = Field(default="assistant")


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


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

