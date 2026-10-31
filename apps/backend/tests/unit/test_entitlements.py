"""PostgreSQL-backed tests for product-scoped entitlement policy decisions."""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import pytest
from app.db.models.models import EntitlementOverride, Membership, Plan, Product, Service, Subscription, Tenant, User
from app.services.entitlements import check_entitled

@pytest.mark.asyncio
@pytest.mark.parametrize(("policy","org","individual","expected"), [
    ("organization_only",False,False,False), ("organization_only",False,True,False),
    ("organization_only",True,False,True), ("organization_only",True,True,True),
    ("individual_only",False,False,False), ("individual_only",False,True,True),
    ("individual_only",True,False,False), ("individual_only",True,True,True),
    ("organization_or_individual",False,False,False), ("organization_or_individual",False,True,True),
    ("organization_or_individual",True,False,True), ("organization_or_individual",True,True,True),
    ("organization_and_individual",False,False,False), ("organization_and_individual",False,True,False),
    ("organization_and_individual",True,False,False), ("organization_and_individual",True,True,True),
])
async def test_all_four_policy_modes(db_session, policy, org, individual, expected):
    tenant=Tenant(name="Policy Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username=f"u-{uuid4().hex[:8]}",email=f"{uuid4()}@example.com",
              full_name="Policy User",is_active=True,tenant_id=tenant.id)
    product=Product(slug=f"p-{uuid4().hex[:8]}",name="Policy Product",audience="policy-api",
                    claim_profile="standard",entitlement_policy=policy)
    db_session.add_all([user,product]); await db_session.flush()
    now=datetime.now(timezone.utc)
    if org:
        plan=Plan(name="Policy Plan",price=10.0); db_session.add(plan); await db_session.flush()
        db_session.add(Subscription(tenant_id=tenant.id,product_id=product.id,plan_id=plan.id,
            status="active",current_period_start=now-timedelta(days=1),
            current_period_end=now+timedelta(days=1)))
    if individual:
        db_session.add(Membership(user_id=user.id,tenant_id=tenant.id,product_id=product.id,
                                  role="member",is_active=True))
    await db_session.commit()
    assert await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product) is expected

@pytest.mark.asyncio
async def test_subscription_is_product_scoped(db_session):
    tenant=Tenant(name="Scoped Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username="scoped-user",email=f"{uuid4()}@example.com",full_name="Scoped",
              is_active=True,tenant_id=tenant.id)
    product=Product(slug="scoped-product",name="Scoped",audience="scoped-api",
                    entitlement_policy="organization_only")
    other=Product(slug="other-product",name="Other",audience="other-api")
    plan=Plan(name="Scoped Plan",price=10.0)
    db_session.add_all([user,product,other,plan]); await db_session.flush()
    now=datetime.now(timezone.utc)
    db_session.add(Subscription(tenant_id=tenant.id,product_id=other.id,plan_id=plan.id,
        status="active",current_period_start=now-timedelta(days=1),current_period_end=now+timedelta(days=1)))
    await db_session.commit()
    assert not await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product)

@pytest.mark.asyncio
async def test_expired_subscription_does_not_grant_access(db_session):
    tenant=Tenant(name="Expired Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username="expired-user",email=f"{uuid4()}@example.com",full_name="Expired",
              is_active=True,tenant_id=tenant.id)
    product=Product(slug="expired-product",name="Expired",audience="expired-api",
                    entitlement_policy="organization_only")
    plan=Plan(name="Expired Plan",price=10.0)
    db_session.add_all([user,product,plan]); await db_session.flush()
    now=datetime.now(timezone.utc)
    db_session.add(Subscription(tenant_id=tenant.id,product_id=product.id,plan_id=plan.id,
        status="active",current_period_start=now-timedelta(days=3),current_period_end=now-timedelta(seconds=1)))
    await db_session.commit()
    assert not await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product)

@pytest.mark.asyncio
async def test_inactive_service_is_hard_deny_even_with_grants(db_session):
    tenant=Tenant(name="Disabled Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username="disabled-service-user",email=f"{uuid4()}@example.com",
              full_name="Disabled",is_active=True,tenant_id=tenant.id)
    product=Product(slug="disabled-service",name="Disabled",audience="disabled-api",
                    entitlement_policy="organization_and_individual")
    plan=Plan(name="Disabled Plan",price=10.0)
    service=Service(title="Disabled",slug="disabled-service",icon="wrench",is_active=False,
                    short_desc="Disabled",description="Disabled")
    db_session.add_all([user,product,plan,service]); await db_session.flush()
    now=datetime.now(timezone.utc)
    db_session.add(Subscription(tenant_id=tenant.id,product_id=product.id,plan_id=plan.id,
        status="active",current_period_start=now-timedelta(days=1),current_period_end=now+timedelta(days=1)))
    db_session.add(Membership(user_id=user.id,tenant_id=tenant.id,product_id=product.id,role="member"))
    await db_session.commit()
    assert not await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product)

@pytest.mark.asyncio
async def test_expired_and_revoked_overrides_do_not_grant(db_session):
    tenant=Tenant(name="Override Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username="override-user",email=f"{uuid4()}@example.com",full_name="Override",
              is_active=True,tenant_id=tenant.id)
    product=Product(slug="override-product",name="Override",audience="override-api",
                    entitlement_policy="organization_only")
    db_session.add_all([user,product]); await db_session.flush()
    now=datetime.now(timezone.utc)
    db_session.add_all([
        EntitlementOverride(product_id=product.id,tenant_id=tenant.id,
            expires_at=now-timedelta(seconds=1),reason="Expired override",granted_by_sub="ops"),
        EntitlementOverride(product_id=product.id,tenant_id=tenant.id,
            expires_at=now+timedelta(days=1),reason="Revoked override",granted_by_sub="ops",
            revoked_at=now,revoked_by_sub="ops"),
    ])
    await db_session.commit()
    assert not await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product)

@pytest.mark.asyncio
async def test_individual_override_is_individual_grant(db_session):
    tenant=Tenant(name="Individual Tenant",email=f"{uuid4()}@example.com")
    db_session.add(tenant); await db_session.flush()
    user=User(username="individual-user",email=f"{uuid4()}@example.com",full_name="Individual",
              is_active=True,tenant_id=tenant.id)
    product=Product(slug="individual-product",name="Individual",audience="individual-api",
                    entitlement_policy="individual_only")
    db_session.add_all([user,product]); await db_session.flush()
    db_session.add(EntitlementOverride(product_id=product.id,tenant_id=tenant.id,user_id=user.id,
        expires_at=datetime.now(timezone.utc)+timedelta(days=1),
        reason="Temporary individual access",granted_by_sub="ops"))
    await db_session.commit()
    assert await check_entitled(db_session,tenant_id=tenant.id,user_id=user.id,product=product)


from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from app.db.models.models import ProductLink
from app.services.entitlements import resolve_org_id


def test_product_link_table_is_preserved():
    assert ProductLink.__tablename__ == "product_links"


@pytest.mark.asyncio
async def test_resolve_org_id_prefers_active_product_link():
    db = AsyncMock()
    tenant_id = uuid4()
    external_org_id = uuid4()
    product = MagicMock(id=uuid4(), slug="generic-product")
    result = MagicMock()
    result.first.return_value = MagicMock(external_org_id=external_org_id)
    db.exec = AsyncMock(return_value=result)

    resolved = await resolve_org_id(
        db,
        tenant_id=tenant_id,
        product=product,
        tenant_tawala_org_id=None,
        tenant_id_fallback=tenant_id,
    )
    assert resolved == external_org_id


@pytest.mark.asyncio
async def test_resolve_org_id_fails_closed_without_explicit_mapping():
    db = AsyncMock()
    tenant_id = uuid4()
    product = MagicMock(id=uuid4(), slug="generic-product")
    result = MagicMock()
    result.first.return_value = None
    db.exec = AsyncMock(return_value=result)

    with pytest.raises(HTTPException) as error:
        await resolve_org_id(
            db,
            tenant_id=tenant_id,
            product=product,
            tenant_tawala_org_id=None,
            tenant_id_fallback=tenant_id,
        )
    assert error.value.status_code == 403
