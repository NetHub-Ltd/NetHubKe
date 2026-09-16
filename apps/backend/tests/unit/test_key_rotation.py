"""Signing key rotation helpers (unit-level, no DB)."""
from app.services.tawala_token import _generate_rsa_keypair, public_jwk_from_private


def test_generate_keypair_has_kid_and_jwk():
    kid, pem, jwk, key = _generate_rsa_keypair()
    assert kid.startswith("nethub-")
    assert "BEGIN PRIVATE KEY" in pem
    assert jwk["kid"] == kid
    assert jwk["kty"] == "RSA"
    assert public_jwk_from_private(key, kid)["n"] == jwk["n"]
