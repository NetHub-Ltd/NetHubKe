# NetHubKe

IdP-agnostic **resource server** and corporate website monorepo for NetHub.

## Architecture A (binding)

NetHubKe’s backend:

- Accepts an **IdP** bearer access token
- Validates it (issuer, JWKS, intended API audience, and trusted client policy)
- Resolves the local user by `(issuer, subject)`
- Authorizes access to protected user, organization, application, subscription, and entitlement resources
- Owns the central subscription lifecycle and entitlement authority for NetHub products
- Returns controlled JSON resource representations

It does **not** authenticate users, mint product JWTs, exchange tokens, or act as an Authorization Server.

All API clients (website/BFF, Tawala, NetPay, future apps) use the **same** integration mechanism. Details: [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

## Resource Server readiness

The production readiness standard, including token security, authorization, tenant isolation, subscriptions, entitlements, payment integrity, operations, testing, and staging acceptance, is maintained in [docs/RESOURCE_SERVER_READINESS.md](docs/RESOURCE_SERVER_READINESS.md).

## API and stack

API overview: [docs/API.md](docs/API.md) · Integration contract: [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) · Stack: [docs/BACKEND_STACK.md](docs/BACKEND_STACK.md) · OpenAPI on the deployed API at `/docs`.

## Repository layout

```text
apps/backend/     FastAPI resource server
apps/frontend/    Next.js website + BFF (Auth.js OIDC)
docs/             Human documentation (sanitized)
.github/workflows CI (tests, image build)
```

## Backend (local)

```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env   # fill from a secret store — never commit .env
# run Postgres, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Frontend (local)

See [apps/frontend/README.md](apps/frontend/README.md). Configure Auth.js and `NETHUB_API_URL` via local env — not committed secrets.

## Documentation hygiene

- No production client IDs, tokens, passwords, or private emails in git
- Use placeholders (`auth.example.com`, `user@example.com`, empty `AUDIENCE=`)
- Real values live in your secret manager / SOPS — not in markdown

## Security reporting

Report vulnerabilities privately to the NetHub maintainers. Do not open public issues that include secrets or live tokens.
