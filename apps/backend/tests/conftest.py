"""Pytest fixtures: env → app import → Postgres session → HTTP client → auth helpers."""
from __future__ import annotations

import os
import time
import uuid
from typing import Any, AsyncGenerator, Dict
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

# ---------------------------------------------------------------------------
# Env MUST be set before importing app.core.config / app.main
# ---------------------------------------------------------------------------
_TEST_ENV = {
    "APP_NAME": "NetHubKe-Test",
    "APP_VERSION": "0.0.0",
    "IMAGE_TAG": "test",
    "STARTUP_TEST": "false",
    "ENVIRONMENT": "development",
    "FASTAPI_DB_USER": os.environ.get("FASTAPI_DB_USER", "nethub_ci"),
    "FASTAPI_DB_PASSWORD": os.environ.get("FASTAPI_DB_PASSWORD") or "",
    "FASTAPI_DB_NAME": os.environ.get("FASTAPI_DB_NAME", "nethub_ci"),
    "FASTAPI_DB_HOST": os.environ.get("FASTAPI_DB_HOST", "localhost"),
    "FASTAPI_DB_PORT": os.environ.get("FASTAPI_DB_PORT", "5432"),
    "KEYCLOAK_ISSUER_URL": "https://idp.test/realms/nethub",
    "KEYCLOAK_JWKS": "https://idp.test/realms/nethub/protocol/openid-connect/certs",
    "AUDIENCE": "nethub-backend",
    "ALLOWED_ORIGINS": "http://localhost:3000,http://test",
    "REDIS_URL": os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    "TAWALA_EXCHANGE_ENABLED": "false",
    "TAWALA_JWT_ISSUER": "http://localhost:8000",
    "TAWALA_JWT_AUDIENCE": "tawala-api",
    "JWKS_REDIS_TTL_SEC": "60",
}
for k, v in _TEST_ENV.items():
    os.environ.setdefault(k, v)

from app.core import config as config_module

config_module.get_settings.cache_clear()
from app.core.config import settings  # noqa: E402

from app.api.deps import get_session  # noqa: E402
from app.db.models import models as _models  # noqa: F401, E402
from app.main import app  # noqa: E402


def pytest_configure(config):
    config.addinivalue_line("markers", "integration: requires Postgres")


@pytest_asyncio.fixture(scope="function")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Function-scoped engine + NullPool avoids cross-loop Future errors."""
    engine = create_async_engine(
        settings.async_db_url,
        poolclass=NullPool,
        echo=False,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    Session = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
    async with Session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def _override():
        yield db_session

    app.dependency_overrides[get_session] = _override
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def rsa_keys():
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    return key, private_pem, key.public_key()


@pytest.fixture
def make_kc_token(rsa_keys):
    """Build a Keycloak-shaped JWT; pair with patch_decode or mock JWKS."""
    import jwt as pyjwt

    key, _, _ = rsa_keys

    def _make(
        *,
        sub: str | None = None,
        email: str = "user@example.com",
        scopes: str = "openid profile email user:read user:write",
        roles: list | None = None,
        aud: str = "nethub-backend",
        iss: str = "https://idp.test/realms/nethub",
        expired: bool = False,
    ) -> str:
        now = int(time.time())
        payload: Dict[str, Any] = {
            "sub": sub or str(uuid.uuid4()),
            "email": email,
            "preferred_username": email.split("@")[0],
            "name": "Test User",
            "email_verified": True,
            "scope": scopes,
            "realm_access": {"roles": roles or ["user"]},
            "iss": iss,
            "aud": aud,
            "iat": now - 10,
            "exp": now - 100 if expired else now + 3600,
        }
        return pyjwt.encode(payload, key, algorithm="RS256", headers={"kid": "test"})

    return _make


@pytest.fixture
def patch_kc_decode(rsa_keys, monkeypatch):
    """Patch security._decode_token path to use local RSA instead of network JWKS."""
    import jwt as pyjwt
    from app.core import security as security_mod
    from app.db.schemas.schemas import TokenData

    key, _, pub = rsa_keys

    def _decode(token: str) -> TokenData:
        try:
            payload = pyjwt.decode(
                token,
                pub,
                algorithms=["RS256"],
                audience=settings.audience,
                issuer=settings.keycloak_issuer_url,
                leeway=10,
            )
        except pyjwt.ExpiredSignatureError:
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as exc:
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Invalid token") from exc

        raw_scope = payload.get("scope") or ""
        if isinstance(raw_scope, list):
            raw_scope = " ".join(raw_scope)
        realm_access = payload.get("realm_access") or {}
        roles = list(realm_access.get("roles") or [])
        return TokenData(
            sub=payload.get("sub"),
            email=payload.get("email"),
            preferred_username=payload.get("preferred_username"),
            name=payload.get("name"),
            email_verified=payload.get("email_verified", False),
            roles=roles,
            scope=raw_scope,
        )

    monkeypatch.setattr(security_mod, "_decode_token", _decode)
    return _decode
