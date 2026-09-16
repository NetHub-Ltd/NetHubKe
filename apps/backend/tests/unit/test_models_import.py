from app.db.models.models import User, Tenant, Service, SigningKey


def test_models_importable():
    assert User.__tablename__ == "users"
    assert Tenant.__tablename__ == "tenants"
    assert Service.__tablename__ == "services"
    assert SigningKey.__tablename__ == "signing_keys"
