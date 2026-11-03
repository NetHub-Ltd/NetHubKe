# NetHubKe backend image

| Item | Value |
|------|--------|
| Registry | `ghcr.io/nethub-ltd/nethubke` |
| Context | `apps/backend` |
| Dockerfile | `apps/backend/Dockerfile` |
| Workflow | `.github/workflows/build_and_push.yml` |

## Tags

- `0.0.<run_number>` — Flux ImagePolicy-friendly (branch pushes to `master`/`main`)
- `sha-<short>` — immutable
- `latest` — branch pushes only
- `v*` — from git tags

## Runtime env

All settings via **pydantic_settings** (see `.env.example`):

- `FASTAPI_DB_*` (assembled to async + sync URLs in-process)
- `OIDC_ISSUER`, `OIDC_JWKS_URL`, `AUDIENCE`
- `RUN_MIGRATIONS=true` (default) — Alembic `upgrade head` before uvicorn
- `HOST`, `PORT`, `WORKERS`

## Architecture A

Image serves the **resource server** only: validate IdP Bearer → resolve user → JSON.  
No product-token minting.
