from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class EnvironmentEnum(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("./.env", "./.env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Basic app settings
    app_name: str
    app_version: str
    image_tag: str
    startup_test: bool

    # PostgreSQL connection settings
    FASTAPI_DB_USER: str
    FASTAPI_DB_PASSWORD: str
    FASTAPI_DB_NAME: str
    FASTAPI_DB_HOST: str
    FASTAPI_DB_PORT: int = 5432

    # Provider-neutral upstream OIDC configuration.
    # All protocol endpoints are resolved from the issuer discovery document.
    oidc_issuer: str | None = None
    oidc_role_claim_path: str = "roles"

    # Expected audience on upstream access tokens.
    audience: str = "nethub-api"
    algorithms: list[str] = ["RS256"]
    jwks_cache_ttl: int = 300
    allowed_origins: str

    # Shared product-token issuer configuration.
    # The Product registry supplies each product's audience.
    product_token_exchange_enabled: bool = False
    product_token_private_key: str = ""
    product_token_issuer: str = "https://api.nethub.local"
    product_token_ttl_sec: int = 240
    product_token_allow_env_pem: bool = False

    # Redis is a disposable cache; PostgreSQL remains authoritative.
    redis_url: str = "redis://localhost:6379/0"
    jwks_redis_ttl_sec: int = 120

    # Encrypt private signing keys at rest; keep stable and back up separately.
    signing_key_encryption_key: str = ""
    signing_key_max_age_hours: int = 168
    signing_key_retire_overlap_hours: int = 24

    environment: EnvironmentEnum = Field(default=EnvironmentEnum.DEVELOPMENT)

    @property
    def idp_issuer(self) -> str:
        """Configured OIDC issuer; endpoint paths are obtained through discovery."""
        value = (self.oidc_issuer or "").strip()
        if not value:
            raise ValueError("OIDC_ISSUER must be set")
        return value.rstrip("/")

    @property
    def async_db_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}"
            f"@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"
        )

    @property
    def sync_db_url(self) -> str:
        return (
            f"postgresql://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}"
            f"@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"
        )

    @property
    def cors_origins(self) -> list[str]:
        if not self.allowed_origins:
            return []
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip() and origin.strip() != "*"
        ]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
