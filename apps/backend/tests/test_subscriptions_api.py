"""Subscription, entitlement, and payment webhook API tests."""
from __future__ import annotations

import hashlib
import hmac
import json
import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_token_data
from app.core.config import settings
from app.db.models.models import PaymentEvent, Subscription
from app.db.schemas.schemas import TokenData
from app.db.session import get_session
from app.main import app

ISSUER = "https://idp.test/realms/nethub"
SECRET = "test-webhook-secret-value"


def _token(sub: str, email: str) -> TokenData:
    return TokenData(sub=sub, email=email, name=email, issuer=ISSUER)


def _sign(body: bytes) -> str:
    digest = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


@pytest.fixture
async def client_env(monkeypatch):
    monkeypatch.setenv("PAYMENT_WEBHOOK_SECRET", SECRET)
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAILS", "admin@example.com")
    from app.core import config as config_module

    config_module.get_settings.cache_clear()
    # reload settings singleton used by security/webhooks
    import app.core.config as cfg

    cfg.settings = cfg.get_settings()
    import app.crud.subscriptions as sub_mod

    # ensure crud sees secret via settings property
    monkeypatch.setattr(
        "app.crud.subscriptions.settings",
        cfg.settings,
        raising=False,
    )

    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    current = {"token": _token("admin-sub", "admin@example.com")}

    async def _override_session():
        async with maker() as session:
            yield session

    async def _override_token():
        return current["token"]

    app.dependency_overrides[get_session] = _override_session
    app.dependency_overrides[get_token_data] = _override_token

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, current, maker

    app.dependency_overrides.clear()
    config_module.get_settings.cache_clear()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_trial_grant_entitlements_and_cross_org_denied(client_env):
    client, current, maker = client_env
    await client.post("/api/v1/users/sync")
    org = (
        await client.post(
            "/api/v1/organizations", json={"name": "Biz", "slug": "biz-1"}
        )
    ).json()
    org_id = org["organization"]["id"]

    trial = await client.post(
        f"/api/v1/admin/organizations/{org_id}/subscriptions/trial",
        json={"product": "tawala", "plan_code": "pro"},
    )
    assert trial.status_code == 201, trial.text
    assert trial.json()["status"] == "trial"
    assert trial.json()["effective"] is True

    ents = await client.get(
        f"/api/v1/organizations/{org_id}/entitlements",
        params={"product": "tawala"},
    )
    assert ents.status_code == 200, ents.text
    caps = {c["capability"]: c for c in ents.json()["capabilities"]}
    assert "tawala.inventory.manage" in caps
    assert ents.json()["subscription_effective"] is True

    # Other user cannot read
    current["token"] = _token("other", "other@example.com")
    await client.post("/api/v1/users/sync")
    denied = await client.get(
        f"/api/v1/organizations/{org_id}/entitlements",
        params={"product": "tawala"},
    )
    assert denied.status_code == 404


@pytest.mark.asyncio
async def test_webhook_signature_and_idempotency(client_env):
    client, current, maker = client_env
    await client.post("/api/v1/users/sync")
    org_id = (
        await client.post(
            "/api/v1/organizations", json={"name": "Pay Co", "slug": "pay-co"}
        )
    ).json()["organization"]["id"]

    # seed plans via catalog
    await client.get("/api/v1/plans")

    payload = {
        "event_id": "evt-1",
        "idempotency_key": "idem-1",
        "event_type": "payment.succeeded",
        "organization_id": org_id,
        "product": "netpay",
        "plan_code": "starter",
        "amount_cents": 1000,
        "currency": "KES",
    }
    raw = json.dumps(payload).encode()
    bad = await client.post(
        "/api/v1/webhooks/payments/mpesa",
        content=raw,
        headers={"Content-Type": "application/json", "X-NetHub-Signature": "sha256=dead"},
    )
    assert bad.status_code == 401

    ok = await client.post(
        "/api/v1/webhooks/payments/mpesa",
        content=raw,
        headers={
            "Content-Type": "application/json",
            "X-NetHub-Signature": _sign(raw),
        },
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["processing_result"] in {"activated", "renewed"}

    # Duplicate
    dup = await client.post(
        "/api/v1/webhooks/payments/mpesa",
        content=raw,
        headers={
            "Content-Type": "application/json",
            "X-NetHub-Signature": _sign(raw),
        },
    )
    assert dup.status_code == 200
    assert dup.json()["id"] == ok.json()["id"]

    async with maker() as session:
        events = (await session.exec(select(PaymentEvent))).all()
        assert len(events) == 1
        subs = (await session.exec(select(Subscription))).all()
        assert len(subs) == 1
        assert subs[0].status == "active"
