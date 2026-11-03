# Backend CI database auth

## GitHub Actions

Ephemeral Postgres uses **`POSTGRES_HOST_AUTH_METHOD=trust`**.

- No password secret is required.
- No password is committed (empty `FASTAPI_DB_PASSWORD`).
- User/DB names are non-secret identifiers: `nethub_ci`.

**Do not use `trust` in production.** It is only acceptable because the database exists for a single CI job on an isolated runner and is destroyed afterward.

## Local pytest

Prefer a local password and never commit it:

```bash
export FASTAPI_DB_USER=nethub_ci
export FASTAPI_DB_PASSWORD='...'   # your local value only
export FASTAPI_DB_NAME=nethub_ci
```

Or run local Postgres with trust on localhost only (Docker) — still do not commit credentials.
