"""Product registry model import smoke and isolation constraints."""

from app.db.models.models import Product


def test_product_model_fields():
    assert Product.__tablename__ == "products"
    assert hasattr(Product, "slug")
    assert hasattr(Product, "audience")
    assert hasattr(Product, "claim_profile")


def test_product_slug_and_audience_are_unique_constraints():
    constraints = {constraint.name for constraint in Product.__table__.constraints}
    assert "uq_products_audience" in constraints
    assert Product.__table__.c.slug.unique is True
