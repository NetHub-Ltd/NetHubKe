# Managed signing-key custody and rollout (N2)

## Storage decision

New private PEM values are encrypted with Fernet before they are written to PostgreSQL when `SIGNING_KEY_ENCRYPTION_KEY` is configured. The database value is prefixed `enc:v1:`; public JWK material remains public-only. The encryption key is an application secret and must be stored separately from PostgreSQL, never committed, logged, or sent to product applications.

Production refuses to sign with legacy plaintext rows and refuses to use managed signing keys if `SIGNING_KEY_ENCRYPTION_KEY` is missing or invalid. This is application-layer encryption in addition to (not a substitute for) database/storage encryption. Fernet key loss means encrypted signing keys cannot be recovered; keep a protected backup and rotate only through a separately planned process.

Generate a key once using:

```sh
python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'
```

Keep the exact same key across application restarts and replicas. Do not regenerate it during a deployment.

## Existing plaintext rows: required rollout

The current schema stores PEM in a text column, so no schema migration is needed. Existing plaintext rows must be converted before enabling the production environment guard.

1. Take and verify a PostgreSQL backup. Keep exchange disabled.
2. Generate and securely store `SIGNING_KEY_ENCRYPTION_KEY` in the deployment secret manager.
3. Run from `apps/backend` against the intended database with the key configured and `ENVIRONMENT=development` (the helper must be able to read legacy plaintext rows):
   `python scripts/encrypt_signing_keys.py` for a dry run.
4. Review the row count, then run `python scripts/encrypt_signing_keys.py --apply`. The script verifies that each transformed value can be decrypted before committing; it never prints key material.
5. Verify every non-deleted row has the `enc:v1:` prefix and run the signing/JWKS tests. Then set `ENVIRONMENT=production` with the same encryption key.
6. Only enable exchange after key custody, CI and staging checks have passed. This N2 change does not authorize a production flag flip or claim staging readiness.

If the process fails, keep exchange disabled and restore from the verified backup or rerun the idempotent helper after correcting the cause. Do not remove the old database backup until production signing and JWKS verification succeed.

## Runtime behavior

- PostgreSQL remains the durable source of signing keys; Redis is a disposable cache.
- Bootstrap is only permitted while exchange is enabled. A JWKS read with no stored key does not create signing state while exchange is disabled.
- Bootstrap serializes through a PostgreSQL transaction advisory lock and rechecks for an active key.
- Public JWKS filters to public RS256 RSA fields, excludes expired retiring rows, and deduplicates by `kid`.
- Redis cache read/write/delete failures are treated as cache failures; durable key state remains in PostgreSQL. Cache TTL remains bounded by `JWKS_REDIS_TTL_SEC`.
- This is not the N5 emergency compromise-response design. Do not infer a five-minute revocation guarantee from the cache TTL.
