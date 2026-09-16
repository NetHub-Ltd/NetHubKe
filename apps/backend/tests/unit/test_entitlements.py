"""Entitlement cache key + model smoke."""
from uuid import uuid4

from app.services.entitlements import _entitle_cache_key
from app.db.models.models import ProductLink


def test_entitle_cache_key_format():
    tid = uuid4()
    key = _entitle_cache_key(tid, "tawala")
    assert key == f"nethub:as:entitle:{tid}:tawala"


def test_product_link_tablename():
    assert ProductLink.__tablename__ == "product_links"
