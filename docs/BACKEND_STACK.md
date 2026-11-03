# Backend stack (Architecture A)

Locked for NetHubKe resource-server rebuild.

| Concern | Choice |
|---------|--------|
| API | FastAPI |
| Settings | **pydantic_settings** (`BaseSettings`) — env validated at load |
| ORM / models | SQLModel |
| Database | PostgreSQL only |
| Runtime DB access | `sqlmodel.ext.asyncio.session.AsyncSession` (or SQLAlchemy `AsyncSession`) |
| Migrations | Alembic **sync** (separate sync engine/URL) |
| DB configuration | Discrete credentials; URLs **assembled in `config.py`** |
| Async driver | asyncpg |
| Authn of callers | Validate upstream OIDC JWT (resource server); no product JWT issuance |
| Tests | pytest, real Postgres in CI |

## URL assembly

Example pattern (illustrative):

```python
@property
def async_database_uri(self) -> str:
    return (
        f"postgresql+asyncpg://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}"
        f"@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"
    )

@property
def sync_database_uri(self) -> str:
    return (
        f"postgresql://{self.FASTAPI_DB_USER}:{self.FASTAPI_DB_PASSWORD}"
        f"@{self.FASTAPI_DB_HOST}:{self.FASTAPI_DB_PORT}/{self.FASTAPI_DB_NAME}"
    )
```

Alembic `env.py` uses `sync_database_uri`. Application session factory uses `async_database_uri`.
