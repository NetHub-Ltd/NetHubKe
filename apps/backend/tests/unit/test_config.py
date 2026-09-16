"""Config / settings smoke tests."""
from app.core.config import settings


def test_settings_loaded():
    assert settings.app_name
    assert settings.audience == "nethub-backend"
    assert settings.keycloak_issuer_url.startswith("http")


def test_cors_origins_list():
    assert isinstance(settings.cors_origins, list)
    assert any("localhost" in o or "test" in o for o in settings.cors_origins)


def test_db_urls():
    assert "postgresql" in settings.async_db_url
    assert "postgresql" in settings.sync_db_url


def test_exchange_defaults_off():
    assert settings.tawala_exchange_enabled is False
