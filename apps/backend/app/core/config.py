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

    fastapi_db_user: str = Field(alias="FASTAPI_DB_USER")
    fastapi_db_password: str = Field(alias="FASTAPI_DB_PASSWORD")
    fastapi_db_host: str = Field(alias="FASTAPI_DB_HOST")
    fastapi_db_port: int = Field(default=5432, alias="FASTAPI_DB_PORT")
    fastapi_db_name: str = Field(alias="FASTAPI_DB_NAME")

    oidc_issuer: str = Field(alias="OIDC_ISSUER")
    oidc_jwks_url: str | None = Field(default=None, alias="OIDC_JWKS_URL")
    # Bootstrap only when trusted_clients table is empty
    audience: str = Field(default="", alias="AUDIENCE")
    jwt_leeway_seconds: int = Field(default=60, alias="JWT_LEEWAY_SECONDS")

    diagnostics_enabled: bool = Field(default=False, alias="DIAGNOSTICS_ENABLED")
    rate_limit_enabled: bool = Field(default=True, alias="RATE_LIMIT_ENABLED")
    rate_limit_user_routes: str = Field(default="60/minute", alias="RATE_LIMIT_USER_ROUTES")

    redis_url: str | None = Field(default=None, alias="REDIS_URL")
    trusted_clients_cache_ttl: int = Field(default=45, alias="TRUSTED_CLIENTS_CACHE_TTL")
    # Comma-separated emails promoted to admin on sync
    bootstrap_admin_emails: str = Field(default="", alias="BOOTSTRAP_ADMIN_EMAILS")

    @field_validator("fastapi_db_port", "jwt_leeway_seconds", "trusted_clients_cache_ttl", mode="before")
    @classmethod
    def as_int(cls, v):  # noqa: ANN001
        return int(v)

    @field_validator("diagnostics_enabled", "rate_limit_enabled", mode="before")
    @classmethod
    def as_bool(cls, v):  # noqa: ANN001
        if isinstance(v, bool):
            return v
        if v is None:
            return False
        return str(v).strip().lower() in {"1", "true", "yes", "on"}

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def audiences(self) -> list[str]:
        """Comma-separated AUDIENCE values (bootstrap when DB empty)."""
        return [a.strip() for a in self.audience.split(",") if a.strip()]

    @property
    def bootstrap_audiences(self) -> list[str]:
        return self.audiences

    @property
    def admin_bootstrap_emails(self) -> set[str]:
        return {e.strip().lower() for e in self.bootstrap_admin_emails.split(",") if e.strip()}

    @property
    def resolved_jwks_url(self) -> str:
        if self.oidc_jwks_url:
            return self.oidc_jwks_url.rstrip("/")
        return f"{self.oidc_issuer.rstrip('/')}/oauth/v2/keys"

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
