from functools import lru_cache
from urllib.parse import urlparse

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Medical Transcription API"
    ENV: str = Field(default="development")
    SECRET_KEY: str
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_SECURE: bool = True

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
        origins: set[str] = set()
        for origin in self.FRONTEND_ORIGIN.split(","):
            cleaned = origin.strip().rstrip("/")
            if not cleaned:
                continue
            origins.add(cleaned)

            # Include localhost variants for loopback development setups.
            parsed = urlparse(cleaned)
            if parsed.hostname == "localhost":
                port = f":{parsed.port}" if parsed.port else ""
                localhost_variant = f"{parsed.scheme}://127.0.0.1{port}"
                origins.add(localhost_variant)
        return sorted(origins)

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

