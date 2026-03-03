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
    app_name: str = "NetHubKe API"
    app_version: str = "0.1.0"
    image_tag: str = "latest"
    startup_test: bool = True  # Whether to perform a DB connectivity test on startup

    # Database Settings
    FASTAPI_DB_USER: str
    FASTAPI_DB_PASSWORD: str
    FASTAPI_DB_NAME: str
    FASTAPI_DB_HOST: str
    FASTAPI_DB_PORT: int = 5432

    # settings.jwks_url  # https://auth.nethub.co.ke/realms/nethub/protocol/openid-connect/certs
    # settings.keycloak_issuer  # https://auth.nethub.co.ke/realms/nethub
    audience: str = "nethub-backend"
    algorithms: list[str] = ["RS256"]
    jwks_cache_ttl: int = 3600 # e.g. 300 (seconds)

    KEYCLOAK_DOMAIN: str
    KEYCLOAK_REALM: str
    KEYCLOAK_INTERNAL_URL: str
    @property
    def keycloak_issuer(self) -> str:
        return f"{self.KEYCLOAK_DOMAIN}/realms/{self.KEYCLOAK_REALM}"
    @property
    def keycloak_jwks_url(self) -> str:
        return f"{self.KEYCLOAK_INTERNAL_URL}/realms/{self.KEYCLOAK_REALM}/protocol/openid-connect/certs"

    @property
    def keycloak_well_known_url(self) -> str:
        return f"{self.KEYCLOAK_INTERNAL_URL}/realms/{self.KEYCLOAK_REALM}/.well-known/openid-configuration"

    @property
    def async_db_url(self) -> str:
        return f"postgresql+asyncpg://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"

    @property
    def sync_db_url(self) -> str:
        return f"postgresql://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"

    cors_origins: list[str] = ["*"]  # In production, specify allowed origins
    # Environment
    environment: EnvironmentEnum = Field(
        default=EnvironmentEnum.DEVELOPMENT,
        env="ENVIRONMENT",
    )


# use lru cathe to cache the settings instance


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()