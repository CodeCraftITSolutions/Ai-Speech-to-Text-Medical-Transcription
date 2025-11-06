from functools import lru_cache

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Medical Transcription API"
    ENV: str = Field(default="development")
    SECRET_KEY: str
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: AnyUrl
    BROKER_URL: AnyUrl

    STORAGE_ENDPOINT: str
    STORAGE_BUCKET: str
    STORAGE_KEY: str
    STORAGE_SECRET: str

    FRONTEND_ORIGIN: str = "http://localhost:3000,http://localhost:5173"

    @property
    def frontend_origins(self) -> list[str]:
        """Return the configured list of frontend origins for CORS."""
        return [
            origin.strip()
            for origin in self.FRONTEND_ORIGIN.split(",")
            if origin.strip()
        ]

    ASR_MODEL: str = "whisper-large"  # TODO: used by AI team

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def model_post_init(self, __context: dict[str, object]) -> None:
        super().model_post_init(__context)
        self.DATABASE_URL = str(self.DATABASE_URL)
        self.BROKER_URL = str(self.BROKER_URL)

@lru_cache
def get_settings() -> Settings:
    return Settings()

