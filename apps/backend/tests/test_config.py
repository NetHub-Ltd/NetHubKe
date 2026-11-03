import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_settings


def test_settings_assemble_async_and_sync_uris(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("FASTAPI_DB_USER", "u")
    monkeypatch.setenv("FASTAPI_DB_PASSWORD", "p@ss")
    monkeypatch.setenv("FASTAPI_DB_HOST", "db.example")
    monkeypatch.setenv("FASTAPI_DB_PORT", "5433")
    monkeypatch.setenv("FASTAPI_DB_NAME", "nethub")
    monkeypatch.setenv("OIDC_ISSUER", "https://issuer.example")
    monkeypatch.setenv("AUDIENCE", "nethub-api")

    s = Settings()  # type: ignore[call-arg]
    assert s.async_database_uri.startswith("postgresql+asyncpg://")
    assert "db.example:5433/nethub" in s.async_database_uri
    assert "p%40ss" in s.async_database_uri
    assert s.sync_database_uri.startswith("postgresql+psycopg2://")
    assert "db.example:5433/nethub" in s.sync_database_uri
    get_settings.cache_clear()


def test_missing_required_db_user_raises(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.delenv("FASTAPI_DB_USER", raising=False)
    with pytest.raises(ValidationError):
        Settings(
            FASTAPI_DB_PASSWORD="x",
            FASTAPI_DB_HOST="h",
            FASTAPI_DB_NAME="n",
            OIDC_ISSUER="https://issuer.example",
        )  # type: ignore[call-arg]
    get_settings.cache_clear()
