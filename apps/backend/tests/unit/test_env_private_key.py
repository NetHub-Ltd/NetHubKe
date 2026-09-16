"""Negative cases for TAWALA_JWT_PRIVATE_KEY env handling."""
from __future__ import annotations

from unittest.mock import patch

from app.services import tawala_token as tt


def test_load_env_private_key_disabled_by_default():
    """Even a PEM-looking value is ignored unless TAWALA_JWT_ALLOW_ENV_PEM=true."""
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", False):
        with patch.object(
            tt.settings,
            "tawala_jwt_private_key",
            "-----BEGIN PRIVATE KEY-----\nMII\n-----END PRIVATE KEY-----\n",
        ):
            assert tt._load_env_private_key() is None


def test_load_env_private_key_empty():
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(tt.settings, "tawala_jwt_private_key", ""):
            assert tt._load_env_private_key() is None


def test_load_env_private_key_hex_secret_does_not_raise():
    """Production misconfig: hex string instead of PEM must not raise."""
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(
            tt.settings, "tawala_jwt_private_key", "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET"
        ):
            assert tt._load_env_private_key() is None


def test_load_env_private_key_random_garbage_does_not_raise():
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(tt.settings, "tawala_jwt_private_key", "not-a-key-at-all"):
            assert tt._load_env_private_key() is None


def test_load_env_private_key_malformed_pem_begin_does_not_raise():
    bad = "-----BEGIN PRIVATE KEY-----\nnot-valid-base64@@@\n-----END PRIVATE KEY-----\n"
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(tt.settings, "tawala_jwt_private_key", bad):
            assert tt._load_env_private_key() is None


def test_load_env_private_key_valid_pem():
    _, pem, _, key = tt._generate_rsa_keypair()
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(tt.settings, "tawala_jwt_private_key", pem):
            loaded = tt._load_env_private_key()
            assert loaded is not None
            assert (
                loaded.public_key().public_numbers().n
                == key.public_key().public_numbers().n
            )


def test_get_jwks_with_hex_env_returns_empty_keys():
    with patch.object(tt.settings, "tawala_jwt_allow_env_pem", True):
        with patch.object(
            tt.settings, "tawala_jwt_private_key", "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET"
        ):
            doc = tt.get_jwks()
            assert doc == {"keys": []}


def test_ensure_fresh_uses_default_seven_day_max_age():
    assert int(getattr(tt.settings, "signing_key_max_age_hours", 168)) == 168
