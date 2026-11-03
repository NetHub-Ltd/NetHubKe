"""Application settings — all env validated via pydantic_settings."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal
from urllib.parse import quote_plus

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="NetHubKe", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    image_tag: str = Field(default="dev", alias="IMAGE_TAG")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    allowed_origins: str = Field(default="http://localhost:3000", alias="ALLOWED_ORIGINS")

    # Discrete DB credentials — URLs assembled below (not a single DATABASE_URL source of truth)
    fastapi_db_user: str = Field(alias="FASTAPI_DB_USER")
    fastapi_db_password: str = Field(alias="FASTAPI_DB_PASSWORD")
    fastapi_db_host: str = Field(alias="FASTAPI_DB_HOST")
    fastapi_db_port: int = Field(default=5432, alias="FASTAPI_DB_PORT")
    fastapi_db_name: str = Field(alias="FASTAPI_DB_NAME")

    # OIDC resource-server (IdP-agnostic)
    oidc_issuer: str = Field(alias="OIDC_ISSUER")
    oidc_jwks_url: str | None = Field(default=None, alias="OIDC_JWKS_URL")
    audience: str = Field(default="nethub-api", alias="AUDIENCE")

    @field_validator("fastapi_db_port", mode="before")
    @classmethod
    def port_as_int(cls, v):  # noqa: ANN001
        return int(v)

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def async_database_uri(self) -> str:
        user = quote_plus(self.fastapi_db_user)
        password = quote_plus(self.fastapi_db_password)
        return (
            f"postgresql+asyncpg://{user}:{password}"
            f"@{self.fastapi_db_host}:{self.fastapi_db_port}/{self.fastapi_db_name}"
        )

    @property
    def sync_database_uri(self) -> str:
        """For Alembic (sync) — same credentials, sync driver scheme."""
        user = quote_plus(self.fastapi_db_user)
        password = quote_plus(self.fastapi_db_password)
        return (
            f"postgresql+psycopg2://{user}:{password}"
            f"@{self.fastapi_db_host}:{self.fastapi_db_port}/{self.fastapi_db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
