"""Product registry model import smoke."""
from app.db.models.models import Product


def test_product_model_fields():
    assert Product.__tablename__ == "products"
    # SQLModel field presence
    assert hasattr(Product, "slug")
    assert hasattr(Product, "audience")
    assert hasattr(Product, "claim_profile")
