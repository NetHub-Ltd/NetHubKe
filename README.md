# NetHubKe

IdP-agnostic **OAuth 2.0 Resource Server** and corporate website monorepo for **NetHub**.

NetHubKe validates IdP access tokens, resolves principals, enforces authorization (including organization membership), and is the **central subscription lifecycle and entitlement authority** for NetHub products (Tawala, NetPay, and future apps).

It does **not** authenticate users, mint product JWTs, run login UI, or act as an Authorization Server.

---

## Current progress (2026-11)

| Area | Status |
|------|--------|
| Architecture A resource-server contract | **Done** |
| JWT validation (signature, issuer, exp, sub) | **Done** |
| Resource audience (`RESOURCE_AUDIENCE`) + trusted clients | **Done** (P0) |
| User sync by `(issuer, subject)` | **Done** |
| Service applications (user-owned quotes) | **Done** |
| Organization membership + roles | **Done** (P1) |
| Platform admin (one-shot bootstrap + explicit API) | **Done** (P1) |
| Security audit events | **Done** (P1) |
| Threat model | **Done** (P1) |
| Plans, subscriptions, request-time evaluation | **Done** (P2) |
| Entitlement catalogue + org query API | **Done** (P2) |
| Payment webhooks (HMAC, idempotent) | **Done** (P2) |
| Staging E2E evidence pack / G6 go-no-go | Open |
| Attaching quote applications to organizations | Open (optional) |

Readiness checklist: [docs/RESOURCE_SERVER_READINESS.md](docs/RESOURCE_SERVER_READINESS.md)

---

## Documentation map

| Doc | Purpose |
|-----|---------|
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | **Client integration how-to** (token flow, trusted clients, routes) |
| [docs/IDP_TOKEN_PROFILE.md](docs/IDP_TOKEN_PROFILE.md) | Access-token claim contract (audience vs client) |
| [docs/AUTHZ_MATRIX.md](docs/AUTHZ_MATRIX.md) | Every route and its protection class |
| [docs/SUBSCRIPTIONS.md](docs/SUBSCRIPTIONS.md) | Plans, lifecycle, entitlements, webhooks |
| [docs/CLIENT_INTEGRATION_GUIDE.md](docs/CLIENT_INTEGRATION_GUIDE.md) | End-to-end guide for website / Tawala / NetPay |
| [docs/API.md](docs/API.md) | Human API overview (OpenAPI remains canonical) |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | Threats and mitigations |
| [docs/BACKEND_STACK.md](docs/BACKEND_STACK.md) | Stack notes |
| [docs/A6_STAGING_SOAK.md](docs/A6_STAGING_SOAK.md) | Staging soak runbook |

---

## Architecture (binding)

```text
Product client / website BFF
        │  Authorization: Bearer <IdP access token>
        ▼
NetHubKe Resource Server
  • Verify JWT (JWKS, iss, exp, sub)
  • Resource audience (RESOURCE_AUDIENCE)
  • Trusted client (azp / client_id)
  • Resolve user (issuer, subject)
  • Authorize (user / org membership / platform admin)
  • Subscriptions & entitlements (org + product)
        │
        ▼
 PostgreSQL (+ optional Redis cache for trusted clients)
```

External **IdP** (e.g. Zitadel at your configured issuer) owns login, MFA, and token issuance.

---

## Repository layout

```text
apps/backend/     FastAPI resource server (SQLModel, Alembic, pytest)
apps/frontend/    Next.js corporate site + BFF (Auth.js OIDC)
docs/             Human documentation (sanitized placeholders only)
.github/workflows CI (pytest, alembic, image build, frontend)
```

---

## Backend (local)

```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env   # fill from a secret store — never commit .env
# Postgres up, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Critical env (see `.env.example`):

| Variable | Role |
|----------|------|
| `OIDC_ISSUER` / `OIDC_JWKS_URL` | IdP trust |
| `RESOURCE_AUDIENCE` | Required in staging/production — token `aud` must match |
| `AUDIENCE` | Bootstrap trusted **client** ids when DB empty |
| `BOOTSTRAP_ADMIN_EMAILS` | Elevate matching users **only on first provision** |
| `PAYMENT_WEBHOOK_SECRET` | HMAC for `/api/v1/webhooks/payments/{provider}` |

Health: `GET /health` · Ready: `GET /ready` · OpenAPI: `/docs`

---

## Frontend (local)

See [apps/frontend/README.md](apps/frontend/README.md). Configure Auth.js and server-only `NETHUB_API_URL`. No production secrets in the browser.

---

## Client integration (short path)

1. User signs in at the IdP; client obtains an **access token** (not an ID token).
2. Ensure token `aud` includes NetHubKe’s `RESOURCE_AUDIENCE` and `azp`/`client_id` is registered in `trusted_clients`.
3. `POST /api/v1/users/sync` then use authenticated APIs.
4. Organizations: create/list under `/api/v1/organizations`.
5. Entitlements: `GET /api/v1/organizations/{id}/entitlements?product=tawala`.
6. Payments: provider calls webhook with `X-NetHub-Signature: sha256=…` — never activate from a browser return URL alone.

Full guide: [docs/CLIENT_INTEGRATION_GUIDE.md](docs/CLIENT_INTEGRATION_GUIDE.md)

---

## Quality gates

- Backend CI: pytest + Postgres, Alembic upgrade, Docker build, startup smoke
- Frontend CI: lint, typecheck, production build
- PRs target **`dev`**; do not push directly to `dev` / `master`

---

## Documentation hygiene

- No production client IDs, tokens, passwords, or private emails in git
- Placeholders only (`auth.example.com`, empty secrets)
- Real values live in your secret manager

## Security reporting

Report vulnerabilities privately to NetHub maintainers. Do not open public issues that include secrets or live tokens.
