"""Negative cases for TAWALA_JWT_PRIVATE_KEY env handling."""
from __future__ import annotations

from unittest.mock import patch

from app.services import tawala_token as tt


def test_load_env_private_key_empty():
    with patch.object(tt.settings, "tawala_jwt_private_key", ""):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_hex_secret_does_not_raise():
    """Production misconfig: hex string instead of PEM must not raise."""
    with patch.object(
        tt.settings, "tawala_jwt_private_key", "ddc480aba4241bea319777294689ffab"
    ):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_random_garbage_does_not_raise():
    with patch.object(tt.settings, "tawala_jwt_private_key", "not-a-key-at-all"):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_malformed_pem_begin_does_not_raise():
    bad = "-----BEGIN PRIVATE KEY-----\nnot-valid-base64@@@\n-----END PRIVATE KEY-----\n"
    with patch.object(tt.settings, "tawala_jwt_private_key", bad):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_valid_pem():
    _, pem, _, key = tt._generate_rsa_keypair()
    with patch.object(tt.settings, "tawala_jwt_private_key", pem):
        loaded = tt._load_env_private_key()
        assert loaded is not None
        assert loaded.public_key().public_numbers().n == key.public_key().public_numbers().n


def test_get_jwks_with_hex_env_returns_empty_keys():
    with patch.object(
        tt.settings, "tawala_jwt_private_key", "ddc480aba4241bea319777294689ffab"
    ):
        doc = tt.get_jwks()
        assert doc == {"keys": []}
