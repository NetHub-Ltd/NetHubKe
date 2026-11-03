# NetHubKe

[![Backend CI](https://github.com/NetHub-Ltd/NetHubKe/actions/workflows/backend-ci.yml/badge.svg?branch=dev)](https://github.com/NetHub-Ltd/NetHubKe/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/NetHub-Ltd/NetHubKe/actions/workflows/frontend-ci.yml/badge.svg?branch=dev)](https://github.com/NetHub-Ltd/NetHubKe/actions/workflows/frontend-ci.yml)
[![Issues](https://img.shields.io/github/issues/NetHub-Ltd/NetHubKe)](https://github.com/NetHub-Ltd/NetHubKe/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/NetHub-Ltd/NetHubKe)](https://github.com/NetHub-Ltd/NetHubKe/pulls)
[![License](https://img.shields.io/github/license/NetHub-Ltd/NetHubKe)](https://github.com/NetHub-Ltd/NetHubKe)

NetHubKe is the central identity, authorization and product-token service for the NetHub product ecosystem.

**Zitadel is the current OpenID Connect identity provider. NetHubKe is IdP-agnostic:** it validates upstream OIDC access tokens, maintains canonical ecosystem identity and access policy, and issues short-lived product JWTs. Product APIs validate those JWTs locally through NetHubKe's public JWKS endpoint.

NetHubKe is not a replacement login provider and is not intended to sit in the request path of every product API call.

## Architecture

```text
Browser
  | same-origin HTTPS; session cookie only
  v
Product / NetHubKe website BFF
  | server-to-server; upstream credentials remain server-side
  v
NetHubKe API
  | validates upstream OIDC identity
  | resolves canonical user and product entitlement
  | issues short-lived product JWT when exchange is enabled
  v
PostgreSQL (durable source of truth)
Redis (optional/disposable cache)

Product backend
  | verifies NetHubKe JWT locally using JWKS
  v
Product-owned business authorization
```

### Non-negotiable trust boundaries

- Browser applications call their own same-origin server-side BFF. Browser JavaScript must not call the NetHubKe API origin directly.
- Zitadel access, refresh and ID tokens, NetHubKe product JWTs, machine credentials and signing keys remain server-side.
- NetHubKe is authoritative for canonical ecosystem identity and product/service entitlement decisions.
- Product APIs validate NetHubKe JWT signatures locally using JWKS. They do not call NetHubKe for per-request introspection on hot paths.
- Product-specific business roles and operational permissions remain inside the product.
- PostgreSQL is authoritative. Redis is a disposable cache and must not create authorization grants or become a durable dependency.

See [SSO architecture contract](docs/SSO_ARCHITECTURE_CONTRACT.md) and [client integration contract](docs/CLIENT_INTEGRATION_CONTRACT.md).

## Current implementation and programme status

The repository contains:

- FastAPI API with OIDC issuer, audience, signature and JWKS validation.
- Canonical user identity synchronization and profile operations.
- Product/service registry and entitlement policy evaluation.
- Product-token issuance and public JWKS support, with PostgreSQL-managed signing keys and rotation.
- Administrative entitlement overrides with reason, expiry and audit requirements.
- Next.js website with Auth.js OIDC integration and a server-only backend request helper.

**Important rollout state:** product-token exchange is globally disabled by default. It is controlled by `PRODUCT_TOKEN_EXCHANGE_ENABLED`, a platform-wide switch shared by every registered product—not by a Tawala-specific setting. Keep it false until the applicable milestone acceptance and staging gates are satisfied.

The full browser BFF integration and secure product launch handoff are not yet complete. The client contract defines the required boundary; it must not be read as proof that every proposed BFF route or launch flow already exists. The five-minute stale-access requirement also needs end-to-end evidence from the actual product verifiers. The generated OpenAPI client currently has a localhost base URL and is not an approved browser transport; do not import it into client components. Use the server-only backend helper until typed same-origin BFF routes are implemented.

The SSO programme is tracked in [issue #57](https://github.com/NetHub-Ltd/NetHubKe/issues/57) and proceeds through N0–N10. Consult `.trackers/` and the milestone issues before starting programme work.

## Repository layout

```text
NetHubKe/
├── apps/
│   ├── backend/              # FastAPI, SQLModel, Alembic and pytest
│   │   ├── app/
│   │   ├── alembic/
│   │   ├── docs/
│   │   ├── scripts/
│   │   └── tests/
│   └── frontend/             # Next.js App Router and Auth.js
├── docs/                     # Architecture and client contracts
├── .trackers/                # Task, milestone, state and rollback records
├── .github/workflows/        # Backend/frontend CI
└── README.md
```

## Technology

| Area | Technology |
|---|---|
| Identity provider | Zitadel (OIDC); validation is IdP-agnostic |
| Backend API | Python, FastAPI, Pydantic, SQLModel, Loguru |
| Database and migrations | PostgreSQL, Alembic, asyncpg |
| Cache | Redis (optional) |
| Product-token signing | RS256, PostgreSQL-managed signing keys, JWKS |
| Website | Next.js 16, React 19, TypeScript, Auth.js |
| Frontend data/API | TanStack Query, Zod, Axios, generated OpenAPI client |
| Tests | pytest, backend CI, frontend lint/build checks |

## Local development

### Prerequisites

- Python 3.12 or newer.
- Node.js supported by the installed Next.js version and pnpm.
- PostgreSQL. The backend requires PostgreSQL and fails startup/readiness when it is unavailable or the required schema is missing.
- Redis is optional for cache behavior; it is not the source of truth.

### Backend

```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set the required PostgreSQL and OIDC values in `apps/backend/.env`, then apply migrations and start the API:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Useful endpoints:

- `GET /health` — liveness.
- `GET /ready` — PostgreSQL/schema readiness.
- `/docs` — FastAPI OpenAPI documentation in local development.

### Frontend

```bash
cd apps/frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Configure the Zitadel OIDC application and its callback URL using the values documented in `apps/frontend/.env.example`. The frontend's NetHubKe backend URL is server-only configuration; do not expose it through a `NEXT_PUBLIC_*` variable.

### Tests and quality checks

Backend:

```bash
cd apps/backend
pytest tests/
```

Frontend:

```bash
cd apps/frontend
pnpm lint
pnpm build
```

GitHub Actions is the authoritative CI execution record. Do not report tests as passing unless the corresponding workflow run confirms it.

## Configuration model

Configuration is split between shared platform settings and product registry data.

### Shared platform settings

The backend example file is `apps/backend/.env.example`. Important settings include:

| Variable | Purpose |
|---|---|
| `OIDC_ISSUER`, `OIDC_JWKS_URL` | Upstream identity provider |
| `AUDIENCE` | Audience expected on upstream OIDC access tokens |
| `PRODUCT_TOKEN_EXCHANGE_ENABLED` | One global product-token exchange gate; defaults to `false` |
| `PRODUCT_TOKEN_ISSUER` | Shared issuer for product JWTs |
| `PRODUCT_TOKEN_TTL_SEC` | Shared product-token lifetime, hard-capped by the issuer |
| `SIGNING_KEY_ENCRYPTION_KEY` | Encrypts private signing-key material at rest |
| `SIGNING_KEY_MAX_AGE_HOURS`, `SIGNING_KEY_RETIRE_OVERLAP_HOURS` | Shared key rotation policy |
| `REDIS_URL`, `JWKS_REDIS_TTL_SEC` | Optional cache connection and cache TTL |

`PRODUCT_TOKEN_PRIVATE_KEY` and `PRODUCT_TOKEN_ALLOW_ENV_PEM` are a shared, opt-in local/emergency fallback. PostgreSQL-managed signing keys are preferred; do not place private signing material in frontend configuration.

### Product registry data

Each registered product's exact JWT audience is stored in the PostgreSQL `products` registry. NetHubKe reads the audience from that row; there is no per-product environment-variable audience override. Entitlement policy and the registered claim profile are also product metadata, not separate deployment flags. New product registrations default to the common `standard` claim profile; Tawala's legacy profile is explicit.

All products use the same exchange endpoint, issuer, managed signing-key set and global exchange gate. The requested product slug selects the registered product and its audience/policy; it does not select a separate integration configuration.

## API and security references

- [Authentication / authorization matrix](apps/backend/docs/AUTH_MATRIX.md)
- [Product JWT claim profiles](apps/backend/docs/PRODUCT_CLAIM_PROFILES.md)
- [Signing-key custody](apps/backend/docs/SIGNING_KEY_CUSTODY.md)
- [Client integration contract](docs/CLIENT_INTEGRATION_CONTRACT.md)
- [SSO architecture contract](docs/SSO_ARCHITECTURE_CONTRACT.md)

## Contribution rules

- Read `AGENTS.md`, the skills and current trackers before repository work.
- Follow the N0–N10 programme order unless the user explicitly reprioritizes documentation or a production hotfix.
- Work on topic branches and open PRs targeting `dev`.
- Keep changes scoped, typed, tested and evidence-backed.
- Update `.trackers/` when repository state or accepted scope changes.
- Never commit secrets, enable production exchange, deploy or merge without explicit authorization.
