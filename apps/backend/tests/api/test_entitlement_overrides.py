"""HTTP acceptance tests for authorized and audited entitlement overrides."""
from __future__ import annotations
from datetime import datetime,timedelta,timezone
from uuid import UUID, uuid4
import pytest
from httpx import AsyncClient
from sqlmodel import select
from app.core.config import settings
from app.db.models.models import EntitlementOverride,Product,SecurityAuditEvent,Tenant,User,UserIdentity

async def _admin(db_session):
    user=User(username="override-admin",email=f"{uuid4()}@example.com",
               full_name="Override Admin",is_active=True)
    db_session.add(user); await db_session.flush()
    db_session.add(UserIdentity(issuer=settings.idp_issuer.rstrip("/"),
                                subject="override-operator",user_id=user.id))
    await db_session.commit()
    return user

@pytest.mark.asyncio
async def test_override_requires_dedicated_scope(client:AsyncClient,db_session,make_kc_token,patch_kc_decode):
    actor=await _admin(db_session)
    token=make_kc_token(sub="override-operator",email=actor.email,
                        scopes="openid profile email user:write",roles=["admin"])
    response=await client.post("/api/v1/ops/entitlements/overrides",json={
        "product":"tawala","tenant_id":str(uuid4()),
        "expires_at":(datetime.now(timezone.utc)+timedelta(days=1)).isoformat(),
        "reason":"Approved temporary support access",
    },headers={"Authorization":f"Bearer {token}"})
    assert response.status_code==403

@pytest.mark.asyncio
async def test_create_and_revoke_override_is_audited(client:AsyncClient,db_session,make_kc_token,patch_kc_decode):
    actor=await _admin(db_session)
    tenant=Tenant(name="Override API Tenant",email=f"{uuid4()}@example.com")
    product=Product(slug="override-api-product",name="Override API Product",
                    audience="override-api",entitlement_policy="organization_only")
    db_session.add_all([tenant,product]); await db_session.commit()
    token=make_kc_token(sub="override-operator",email=actor.email,
                        scopes="openid profile email entitlements:override",roles=["ops"])
    headers={"Authorization":f"Bearer {token}"}
    created=await client.post("/api/v1/ops/entitlements/overrides",json={
        "product":product.slug,"tenant_id":str(tenant.id),
        "expires_at":(datetime.now(timezone.utc)+timedelta(days=1)).isoformat(),
        "reason":"Temporary access approved for incident INC-1234",
    },headers=headers)
    assert created.status_code==201,created.text
    override_id=created.json()["id"]
    override=(await db_session.exec(select(EntitlementOverride).where(
        EntitlementOverride.id==UUID(override_id)))).first()
    assert override is not None and override.user_id is None
    created_audit=(await db_session.exec(select(SecurityAuditEvent).where(
        SecurityAuditEvent.action=="entitlement.override.created"))).first()
    assert created_audit is not None and created_audit.target_id==override_id
    revoked=await client.post(f"/api/v1/ops/entitlements/overrides/{override_id}/revoke",
                              headers=headers)
    assert revoked.status_code==200,revoked.text
    await db_session.refresh(override)
    assert override.revoked_at is not None and override.revoked_by_sub=="override-operator"
    revoked_audit=(await db_session.exec(select(SecurityAuditEvent).where(
        SecurityAuditEvent.action=="entitlement.override.revoked"))).first()
    assert revoked_audit is not None
