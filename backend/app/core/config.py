from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = Field(default="dev", alias="APP_ENV")
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(default="change-me", alias="JWT_SECRET")
    jwt_expires_minutes: int = Field(default=43200, alias="JWT_EXPIRES_MINUTES")
    auth_cookie_name: str = Field(default="carrot_stick_session", alias="AUTH_COOKIE_NAME")
    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", alias="COOKIE_SAMESITE")
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGINS",
    )

    @property
    def is_dev(self) -> bool:
        return self.app_env.lower() == "dev"

    @property
    def parsed_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
