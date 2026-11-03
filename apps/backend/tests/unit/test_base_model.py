from app.db.models.base import BaseMixin, EffectiveJSON


def test_effective_json_defined():
    assert EffectiveJSON is not None


def test_base_mixin_fields():
    assert "id" in BaseMixin.model_fields
    assert "created_at" in BaseMixin.model_fields
