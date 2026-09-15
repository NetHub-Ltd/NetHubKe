from __future__ import annotations
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


from enum import Enum

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

    # Basic App Settings
    app_name: str
    app_version: str
    image_tag: str
    startup_test: bool

    # Database Settings
    FASTAPI_DB_USER: str
    FASTAPI_DB_PASSWORD: str
    FASTAPI_DB_NAME: str
    FASTAPI_DB_HOST: str
    FASTAPI_DB_PORT: int = 5432

    # AUTHENTIK_CLIENT_ID: str
    # authentik_jwkrs: str
    keycloak_jwks: str
    keycloak_issuer_url: str

    # JWT audience expected in access tokens (Keycloak client / API audience).
    # Override with env AUDIENCE. Must match tokens issued for this resource server.
    audience: str = "nethub-backend"
    algorithms: list[str] = ["RS256"]
    jwks_cache_ttl: int = 3600  # seconds; PyJWKClient lifespan uses its own cache
    allowed_origins: str

    # Tawala hard-session exchange (ecosystem auth M2). Default OFF.
    tawala_exchange_enabled: bool = False
    # PEM-encoded RSA private key (PKCS8) used to sign aud=tawala-api tokens.
    tawala_jwt_private_key: str = ""
    tawala_jwt_issuer: str = "https://api.nethub.local"
    tawala_jwt_audience: str = "tawala-api"
    tawala_jwt_ttl_sec: int = 28800  # 8 hours
    # If true, tenant must have active subscription to service slug "tawala".
    tawala_exchange_require_subscription: bool = False



    @property
    def async_db_url(self) -> str:
        return f"postgresql+asyncpg://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"

    @property
    def sync_db_url(self) -> str:
        return f"postgresql://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"

    # cors_origins: list[str] = ["http://localhost:3000"]
    @property
    def cors_origins(self) -> list:
        if not self.allowed_origins:
            return []
        # Split by comma, strip whitespace, and filter out empty strings or "*"
        return [f.strip() for f in self.allowed_origins.split(",") if f.strip() and f.strip() != "*"]

    # In production, specify allowed origins
    # Environment
    environment: EnvironmentEnum = Field(
        default=EnvironmentEnum.DEVELOPMENT,
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()