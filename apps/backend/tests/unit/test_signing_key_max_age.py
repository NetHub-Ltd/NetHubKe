"""Signing key max-age policy defaults."""
from app.services import tawala_token as tt


def test_default_max_age_is_seven_days():
    assert getattr(tt.settings, "signing_key_max_age_hours", None) == 168
    assert getattr(tt.settings, "signing_key_retire_overlap_hours", None) == 24
    assert getattr(tt.settings, "tawala_jwt_allow_env_pem", None) is False
