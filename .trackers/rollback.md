# Rollback: N2 managed signing keys

- Branch/issue: `feat/n2-managed-signing-keys` / #146; PR target `dev`.
- No schema migration, deployment change, or feature-flag change is included.
- Revert the implementation PR as one unit if tests or review fail. Do not reset, rebase, squash, force-push, or rewrite existing history.
- Keep token exchange disabled throughout rollout and rollback.
- `SIGNING_KEY_ENCRYPTION_KEY` must be backed up independently of PostgreSQL. Loss of this key makes encrypted private keys unusable; do not rotate or discard it casually.
- Before encrypting existing rows, take and verify a PostgreSQL backup. The rollout helper defaults to dry-run; use `--apply` only after reviewing the count and confirming the encryption key is safely stored.
- If encryption rollout fails, keep exchange disabled. Restore the verified database backup or rerun the idempotent helper after correcting the issue. Never restore plaintext rows into a production runtime that expects encrypted rows and claims production readiness.
- The schema stays compatible because ciphertext uses the existing text column with an `enc:v1:` prefix. Downgrading application code does not decrypt ciphertext; preserve the encryption key and use a compatible application version or restore the pre-migration backup.
- No merge without explicit user approval. Current PR CI evidence: backend CI #71 passed; Docker/Postgres/Redis readiness #32 passed.
