from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_LANGUAGES = {"ru", "en"}
DEFAULT_ICON_PACK_BY_LANGUAGE = {
    "ru": "cookie_whip",
    "en": "carrot_stick",
}


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    login: str


class UserSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    language: str
    icon_pack: str


class AuthResponse(BaseModel):
    user: UserRead
    settings: UserSettingsRead


class RegisterRequest(BaseModel):
    login: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=256)
    language: str

    @field_validator("login")
    @classmethod
    def normalize_login(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Login is required")
        return normalized

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        if value not in VALID_LANGUAGES:
            raise ValueError("Unsupported language")
        return value


class LoginRequest(BaseModel):
    login: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=256)

    @field_validator("login")
    @classmethod
    def normalize_login(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Login is required")
        return normalized


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=6, max_length=256)

