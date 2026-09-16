from app.db.schemas import enums


def test_tenant_tier_exists():
    assert hasattr(enums, "TenantTier")
    # exercise enum members
    members = list(enums.TenantTier)
    assert len(members) >= 1
