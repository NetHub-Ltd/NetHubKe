# Backend stack (Architecture A)

Locked stack for the NetHubKe resource server.

| Concern | Choice |
|---------|--------|
| API | FastAPI |
| Settings | **pydantic_settings** (`BaseSettings`) — env validated at load |
| ORM / models | SQLModel |
| Database | PostgreSQL |
| Runtime DB access | AsyncSession |
| Migrations | Alembic **sync** |
| DB configuration | Discrete `FASTAPI_DB_*` credentials; URLs assembled in config |
| Async driver | asyncpg |
| Sync driver (Alembic) | psycopg2 (`postgresql+psycopg2://…`) |
| Authn of callers | Upstream OIDC JWT validation + **trusted_clients** allowlist |
| Rate limiting | SlowAPI (configurable) |
| Optional cache | Redis (`REDIS_URL`) for trusted-client set |
| Logging | Loguru |
| Tests | pytest; Postgres in CI |

## URL assembly

Application builds URLs internally (do not commit real hosts or passwords):

- Async: `postgresql+asyncpg://…`
- Sync: `postgresql+psycopg2://…`

## Environment

See `apps/backend/.env.example` for **placeholder** names. Inject real values only via a secret manager or sealed secrets — never via public git content.
