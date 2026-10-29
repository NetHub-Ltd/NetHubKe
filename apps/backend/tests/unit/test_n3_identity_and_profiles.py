"""N3 identity mapping and generic product-claim regression tests."""
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import jwt
import pytest
from fastapi import HTTPException

from app.crud.user import user_crud
from app.db.models.models import User, UserIdentity
from app.db.schemas.schemas import TokenData
from app.services import tawala_token as tt


def test_user_identity_schema_has_unique_identity_and_user_issuer_constraints():
    constraints = UserIdentity.__table__.constraints
    unique_columns = {
        tuple(column.name for column in constraint.columns)
        for constraint in constraints
        if constraint.__class__.__name__ == "UniqueConstraint"
    }
    assert ("issuer", "subject") in unique_columns
    assert ("user_id", "issuer") in unique_columns


@pytest.mark.asyncio
async def test_lookup_uses_issuer_and_subject_not_email():
    db = AsyncMock()
    identity = MagicMock(user_id=uuid4())
    result = MagicMock()
    result.first.return_value = identity
    db.exec = AsyncMock(return_value=result)
    expected = MagicMock(spec=User)
    with patch.object(user_crud, "get_by_id", new_callable=AsyncMock, return_value=expected) as by_id:
        user = await user_crud.get_by_upstream_identity(
            db, issuer="https://idp.example/", subject="immutable-sub"
        )
    assert user is expected
    by_id.assert_awaited_once_with(db, identity.user_id)
    query = db.exec.await_args.args[0]
    assert "user_identities" in str(query)
    assert "issuer" in str(query)
    assert "subject" in str(query)


@pytest.mark.asyncio
async def test_sync_never_auto_links_existing_email_account():
    db = AsyncMock()
    token = TokenData(
        sub="subject-1",
        issuer="https://idp.example",
        email="existing@example.com",
        username="existing",
        full_name="Existing User",
    )
    existing = MagicMock(spec=User, id=uuid4(), email="existing@example.com", is_active=True)
    with (
        patch.object(user_crud, "get_by_upstream_identity", new_callable=AsyncMock, return_value=None),
        patch.object(user_crud, "get_by_email", new_callable=AsyncMock, return_value=existing),
    ):
        with pytest.raises(HTTPException) as error:
            await user_crud.get_or_create(db, token)
    assert error.value.status_code == 409
    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_standard_profile_omits_tawala_only_claims(monkeypatch):
    monkeypatch.setattr(tt, "exchange_enabled", lambda: True)
    private_key = tt._generate_rsa_keypair()[3]
    monkeypatch.setattr(
        tt, "get_active_signing_key",
        AsyncMock(return_value=(private_key, "test-standard-kid")),
    )
    token, _ = await tt.mint_product_access_token(
        AsyncMock(),
        product_slug="netpay",
        audience="netpay-api",
        sub=str(uuid4()),
        org_id=None,
        principal="user",
        email="user@example.com",
        claim_profile="standard",
    )
    claims = jwt.decode(
        token,
        private_key.public_key(),
        algorithms=["RS256"],
        audience="netpay-api",
        issuer=tt.settings.tawala_jwt_issuer,
    )
    assert claims["product"] == "netpay"
    assert claims["aud"] == "netpay-api"
    assert claims["jti"]
    assert "org_id" not in claims
    assert "principal" not in claims


@pytest.mark.asyncio
async def test_unknown_claim_profile_fails_closed(monkeypatch):
    monkeypatch.setattr(tt, "exchange_enabled", lambda: True)
    with pytest.raises(HTTPException) as error:
        await tt.mint_product_access_token(
            AsyncMock(),
            product_slug="unknown",
            audience="unknown-api",
            sub="user-1",
            org_id=None,
            principal="user",
            claim_profile="unknown",
        )
    assert error.value.status_code == 503
