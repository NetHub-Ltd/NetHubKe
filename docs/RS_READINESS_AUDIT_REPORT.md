# NetHubKe Resource Server Readiness Audit Report

**Date:** 2026-11-15  
**Branch:** `docs/rs-readiness-audit-2026-11`  
**Baseline:** `dev` at `f0f6011` (includes merged PR #226 — Resource Server readiness checklist)  
**Auditor role:** Agent operating under `AGENTS.md` + NetHub skills  
**Scope:** Full repository inspection against `docs/RESOURCE_SERVER_READINESS.md` gates G0–G6, plus opportunistic findings on security, maintainability, and performance.

---

## 1. Executive summary

PR #226 established an industry-aligned, testable definition of production readiness for NetHubKe as an **OAuth 2.0 Resource Server** and the **central subscription/entitlement authority** for NetHub products. That document is now on `dev`.

This audit inspected the live codebase (backend FastAPI, models, migrations, tests, frontend BFF/Auth.js, trackers, CI) against every major checklist section. Findings are evidence-backed with file paths and symbols.

### Gate-level verdict

| Gate | Required outcome | Verdict | Critical gaps |
|------|------------------|---------|---------------|
| **G0 — Architecture** | Boundaries, trust model, ownership explicit | **Partial** | Contract is documented; threat model and ownership matrix incomplete; subscription/entitlement ownership declared but unimplemented |
| **G1 — Identity & token security** | Invalid/misdirected/expired tokens cannot access resources | **Partial — critical gaps** | Signature + issuer + exp + trusted-client check exist; **resource audience (`aud`) is not validated** in the production path (`verify_aud: False`); scopes parsed but never enforced; no access-token vs ID-token distinction |
| **G2 — Authorization & tenancy** | Every protected operation authorized in resource/org context | **Weak** | Binary `is_admin`; no RBAC/permissions; `tenant_id` is a nullable profile field, not a membership/tenancy model; object-level checks exist only for user-owned applications |
| **G3 — Subscription & entitlements** | Lifecycle and capabilities centrally evaluated | **Absent** | No domain models, APIs, webhooks, evaluation, or tests |
| **G4 — Data & API security** | Isolation, validation, abuse controls | **Partial** | Pydantic validation, rate limits, security headers present; no audit trail, limited isolation model |
| **G5 — Operations** | Deploy, observability, recovery usable | **Partial** | Health/ready, diagnostics gate, logging middleware; no structured security audit events, limited metrics/alerts |
| **G6 — Production acceptance** | Automated + staging evidence of security contract | **Not met** | Unit tests cover core JWT paths and user API; no staging E2E evidence package against the RS checklist |

**Production declaration is blocked** while any **critical** item under G1/G2 remains unverified, and while G3 (now in explicit scope) has zero implementation.

### What already works (do not re-implement)

- IdP-agnostic RS posture: no product JWT minting, no local password store, no Authorization Server endpoints.
- JWT signature verification via JWKS (`PyJWKClient`, RS256/ES256 allowlist), issuer check, `exp`/`sub` required.
- Trusted-client registry with DB-backed active/revoked state and short TTL cache.
- Local user identity keyed by `(issuer, subject)` with uniqueness constraints.
- User sync / me / patch contract used by the website BFF.
- Object-level ownership check on user application read/message routes (`app.user_id != user.id` → 404).
- Rate limiting (slowapi), security headers, CORS allowlist, diagnostics gated in production.
- Health and readiness probes; backend CI with pytest + Postgres.

---

## 2. Method

1. Merged PR #226 into `dev` (via GitHub API; local branch reset to `origin/dev` at merge commit `f0f6011`).
2. Read full checklist `docs/RESOURCE_SERVER_READINESS.md` (528 lines).
3. Inspected backend: `app/core/security.py`, `app/api/deps.py`, routes, CRUD, models, migrations, config, main, tests.
4. Inspected frontend: Auth.js config, BFF routes, `lib/backend.ts`.
5. Cross-checked trackers, INTEGRATIONS.md, API.md, CI workflows.
6. Mapped each critical checklist item to concrete code evidence or explicit absence.
7. Recorded opportunistic quality findings (maintainability, security hygiene, performance).

No runtime staging soak was executed in this session; items requiring live IdP/staging evidence are marked **Not verified (operational)**.

---

## 3. Detailed findings by readiness section

### 3.1 Architecture and responsibility boundaries (G0 / §2)

| Checklist item | Evidence | State | Gap / required change |
|----------------|----------|-------|------------------------|
| Documented as OAuth RS, not AS/IdP | `docs/RESOURCE_SERVER_READINESS.md`, `docs/INTEGRATIONS.md`, `app/core/security.py` docstring, README Architecture A | **Met (docs)** | Keep enforcing anti-drift (no token minting) |
| External IdP is auth authority | `OIDC_ISSUER` / JWKS path; Auth.js on frontend | **Met** | — |
| Does not issue product JWTs | No signing-key config, no encode paths for product tokens in backend | **Met** | Regression tests already assert no `access_token` in user responses |
| Single integration protocol for clients | `POST /users/sync`, Bearer contract | **Partial** | Formalize as versioned integration contract; product clients (Tawala/NetPay) not yet consuming |
| Explicit module boundaries for authz, subscription, entitlement | Folders exist for identity only | **Gap** | Introduce domain modules when subscription/entitlement land; avoid mixing into `users` routes |
| Subscription & entitlement in scope | Checklist §6–7 + milestone note | **Declared only** | Implementation missing (see §3.4) |
| Threat model documented | Not present in repo | **Gap** | Add threat model covering token theft, confused deputy, cross-tenant, webhook forgery, billing abuse, DoS |

**Exact changes:** Add `docs/THREAT_MODEL.md` (or section under readiness) with enumerated threats and mitigations mapped to controls. Keep Architecture A anti-drift language in PR review checklist.

---

### 3.2 Token validation and principal security — CRITICAL (G1 / §3)

#### Cryptographic validation — current state

**File:** `apps/backend/app/core/security.py` → `decode_and_authorize_token`

```python
payload = jwt.decode(
    token,
    signing_key.key,
    algorithms=["RS256", "ES256"],
    issuer=issuer,
    leeway=leeway,
    options={"require": ["exp", "sub"], "verify_aud": False},  # ← critical
)
```

Then:

```python
client_ids = _client_ids_from_payload(payload)  # aud + client_id + azp
if not await tc_crud.is_client_trusted(session, client_ids):
    raise HTTPException(401, "Client is not authorized")
```

| Control | Status | Evidence |
|---------|--------|----------|
| TLS-only bearer in deployed env | Operational / config | Assumed at ingress; not enforced in app |
| Reject missing/malformed credentials | **Met** | `deps.get_token_data` + HTTPBearer |
| JWKS signature verification | **Met** | `PyJWKClient`, cache 300s, timeout 10s |
| Algorithm allowlist | **Met** | RS256, ES256 only |
| Exact issuer validation | **Met** | `issuer=settings.oidc_issuer` |
| **Resource audience (`aud`) validation** | **FAIL** | `verify_aud: False`; trusted-client check is **not** a substitute (checklist §18 explicitly calls this out) |
| `exp` / `sub` required | **Met** | options require |
| `nbf` / `iat` / max token age | **Partial** | library defaults only; no explicit max-age policy |
| Access token vs ID token distinction | **Missing** | No `typ` / `token_use` / profile check |
| `sub` as opaque string | **Met** | `str(sub)` |
| Scopes parsed | **Met** | `_scopes_from_claims` |
| **Scopes enforced per route** | **FAIL** | No dependency or decorator checks scopes |
| Fail closed on JWKS/infra error | **Met** | 401 on exception |
| Trusted client revocation | **Partial** | DB + cache TTL 45s; propagation bound not documented as SLA |

**Why trusted-client ≠ audience validation**

- Audience answers: “Was this token minted **for this resource server**?”
- Trusted client answers: “Is the **calling client** registered and active?”
- A token with `aud=other-api` and a known `azp` could pass today’s check if `azp` is in `trusted_clients`.
- Checklist §18: *“A trusted client ID/authorized-party check is an additional control, not a replacement for resource audience validation.”*

**Exact changes for G1 critical path**

1. Introduce a configured **resource audience** (e.g. `RESOURCE_AUDIENCE` / `NETHUBKE_API_AUDIENCE`) distinct from bootstrap client IDs.
2. Enable `verify_aud=True` (or manual exact match against the resource audience list) in `decode_and_authorize_token`.
3. Keep trusted-client check as a **second** control on `azp`/`client_id`.
4. Add tests: wrong `aud` → 401 even when `azp` is trusted; correct `aud` + untrusted client → 401; both correct → 200.
5. Document IdP token contract (which claim is resource aud, which is client).
6. Optionally enforce required scopes via route dependencies once product scopes are defined.
7. Document JWKS failure and revocation propagation bounds.

---

### 3.3 Authorization and tenancy — CRITICAL (G2 / §4)

#### Authorization model

| Mechanism | Implementation | Assessment |
|-----------|----------------|------------|
| Route protection | `Depends(get_current_user)` / `get_current_admin` | Present for protected routes |
| Admin gate | `user.is_admin` boolean | Binary global flag; no roles/permissions matrix |
| Object-level (applications) | `app.user_id != user.id` → 404 | Correct for user-owned resources |
| Scopes / token roles | Parsed into `TokenData`, **never consulted** for access decisions | Dead data |
| Deny-by-default | Unauthenticated → 401; non-admin on admin routes → 403 | OK for current surface; no policy registry |
| User-supplied privilege fields | `UserUpdate` allows only `full_name`, `username` | Safe |

**Evidence — admin dependency**

```python
# apps/backend/app/api/deps.py
async def get_current_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin required")
    return user
```

**Evidence — bootstrap privilege path**

```python
# apps/backend/app/crud/user.py
def _maybe_bootstrap_admin(user: User) -> None:
    emails = get_settings().admin_bootstrap_emails
    if emails and user.email.lower() in emails:
        user.is_admin = True
```

Called on **every** sync of an existing user. Misconfigured `BOOTSTRAP_ADMIN_EMAILS` permanently elevates. No audit event, no one-shot bootstrap, no removal path after initial setup.

#### Organization / tenant isolation

| Checklist expectation | Current code | Verdict |
|----------------------|--------------|---------|
| Explicit membership model (status, role, lifecycle) | `Tenant` table + optional `User.tenant_id` | **Insufficient** — no membership table, no multi-org, no status |
| Active org context from trusted server state | Not implemented | **Missing** |
| Queries scoped by authorized org | Applications scoped by `user_id` only | **Partial** (user-level, not org-level) |
| Cross-tenant isolation tests | None | **Missing** |
| RLS as defense in depth | Not used | N/A for now |

Checklist §18: *“Do not equate a nullable `tenant_id` profile field with a complete tenancy model.”*

**Exact changes for G2**

1. Design organization membership: `organizations`, `organization_memberships` (user, org, role, status, invited_by, timestamps).
2. Replace global `is_admin` with org-scoped roles + a narrowly granted platform-admin capability.
3. Resolve active organization from server-side session/context, never from client-supplied header alone without membership check.
4. Scope list/search endpoints by membership.
5. One-shot, auditable bootstrap for platform admins; remove continuous re-elevation on sync.
6. Inventory every route: public / authenticated / org-scoped / admin; document in API.md.
7. Tests: two orgs, users with different memberships, IDOR attempts across org boundaries.

---

### 3.4 Subscription management (G3 / §6) — ABSENT

No models, migrations, routes, CRUD, webhooks, or tests for:

- Plans / plan versions  
- Organization–product subscriptions  
- Lifecycle states (trial, active, past_due, canceled, suspended)  
- Payment provider events / idempotency keys  
- Reconciliation or append-only financial history  

**Exact changes (domain design first)**

1. Domain model proposal (issue): entities, state machine, idempotency, audit fields.
2. Alembic migrations (expand-contract).
3. Webhook ingestion with signature verification + unique constraint on provider event IDs.
4. Request-time evaluation of effective subscription (do not rely solely on async jobs).
5. APIs: org-scoped read of subscription state for authorized clients; no client-writable status/price fields.
6. Tests: duplicate webhook, renewal race, expiry enforcement, unauthorized cross-org read.

Until this exists, G3 remains **Not verified / unimplemented**.

---

### 3.5 Entitlement and capability management (G3 / §7) — ABSENT

No capability catalogue, plan mapping, overrides, quotas, or evaluation service.

**Exact changes**

1. Capability identifiers (namespaced strings, e.g. `tawala.inventory.manage`).
2. Plan → capability mapping with versioning.
3. Overrides with reason, actor, effective window.
4. Deterministic evaluation function with pure unit tests.
5. Propagation / cache invalidation bounds documented and tested.
6. Product clients query entitlements for their org/product only.

---

### 3.6 Service-to-service and delegated access (§8)

| Item | State |
|------|--------|
| Distinct machine principals | **Missing** — only human users + trusted client IDs on tokens |
| Service credentials / client credentials flow support | Not modeled beyond trusted_clients rows |
| Delegated user context (act-as) | Not present |

Trusted clients today are “which OIDC client may call the API,” not full service-account identities with separate authz.

**Required:** Model service principals separately when product backends call NetHubKe; keep human and machine identity distinct.

---

### 3.7 API and application security (§9)

| Control | State | Notes |
|---------|-------|-------|
| Input validation | **Met** | Pydantic models with length/pattern constraints |
| Error hygiene | **Mostly met** | Generic 401/403/404 messages; avoid leaking existence where intentional (applications use 404 for both missing and forbidden) |
| Rate limiting | **Met** | slowapi on user routes; config-driven |
| Security headers | **Met** | `SecurityHeadersMiddleware` |
| CORS | **Met** | Explicit origin list |
| Diagnostics exposure | **Met** | Gated when `ENVIRONMENT=production` and flag false |
| CSRF for cookie session | Frontend Auth.js | BFF uses bearer to backend; review cookie flags on Auth.js session |
| No token logging | **Assumed** | Request logging middleware should be verified not to log Authorization |

**Opportunistic issues**

- `ready` probe returns exception string in body on failure — prefer opaque detail in production.
- Bootstrap admin emails re-applied every sync (privilege hygiene).
- Trusted-client bootstrap from env when table empty is convenient but should be disabled or one-shot in production.

---

### 3.8 Data protection and database integrity (§10)

| Item | State |
|------|--------|
| Unique `(issuer, subject)` | **Met** — migration + model |
| Unique email on users | **Met** |
| Financial append-only | N/A until billing |
| RLS | Not used |
| Connection pooling tenant bleed | Low risk today (no request-scoped tenant GUC); re-evaluate if RLS added |
| Backups / restore tests | **Not verified (ops)** |

---

### 3.9 Audit, logging, monitoring (§11)

| Item | State |
|------|--------|
| Security event audit trail | **Missing** — no `audit_events` table or structured emitter |
| Auth failures logged | Partial — JWT rejection logged at warning |
| Metrics (token failures, authz denials, webhook outcomes) | **Missing** |
| Correlation IDs | Request logging middleware present; confirm propagation |
| Health probes non-sensitive | **Mostly** — diagnostics can expose issuer/JWKS URL when enabled |

**Exact change:** Introduce append-oriented audit events for auth failures, admin actions, role changes, client revoke, future subscription transitions. Exclude bearer tokens from all log sinks (add test).

---

### 3.10 Testing and CI (§13)

**Present tests (apps/backend/tests/):**

- `test_security.py` — RSA key JWT unit tests (valid, expired, wrong key, missing sub, multi-aud helper)
- `test_users_api.py` — sync / me / patch with dependency overrides
- `test_applications_flow.py` — application ownership paths
- `test_hardening.py` — headers, diagnostics gate, rate limit
- `test_health.py`, `test_alembic.py`, `test_models.py`, `test_config.py`, startup

**Gaps vs checklist**

- Production path does **not** exercise `verify_aud=True` (helper can; live path cannot).
- No tests for untrusted client with valid crypto.
- No multi-tenant isolation suite.
- No subscription/webhook concurrency tests.
- No contract tests for Tawala/NetPay (products not yet integrated).
- Coverage of security-critical modules not measured as a gate.

CI workflows exist: `backend-ci.yml`, `frontend-ci.yml`, `build_and_push.yml`.

---

### 3.11 Client integration contract (§15)

Documented in `docs/INTEGRATIONS.md` and `docs/API.md`. Frontend BFF correctly:

- Uses server-side Bearer to backend (`lib/backend.ts`)
- Syncs user after login
- Does not expose backend tokens to the browser as product tokens

**Gaps:** Product client onboarding guide incomplete; audience claim contract with Zitadel not pinned in a single “IdP token profile” doc.

---

## 4. Opportunistic quality findings

### Security

1. **`verify_aud: False` in production decoder** — highest priority fix (see §3.2).
2. **Continuous admin bootstrap** — change to one-shot or explicit admin-provisioning API with audit.
3. **Ready endpoint error detail** — may leak DB connection errors; sanitize in production.
4. **No audit log** for privileged actions (client revoke, status changes).
5. **Scope claims ignored** — either enforce or stop implying they matter in TokenData consumers.

### Maintainability

1. Route inventory not documented as a security matrix (public / auth / admin).
2. `Tenant` model is dead weight without membership — either implement org model or document as future placeholder.
3. Duplicated `_to_read` helpers in `applications.py` and `admin.py` — extract shared serializer.
4. Milestone tracker still speaks “Architecture A bare minimum”; readiness checklist now supersedes for subscriptions — already noted in milestone header; keep docs aligned.

### Performance

1. JWKS client is process-global with 300s lifespan — acceptable; document rotation behavior.
2. Trusted-clients cache 45s — good for revocation lag bound; ensure Redis failure falls back to DB (verify `cache_get` behavior).
3. Application list endpoints load messages inline — acceptable at current scale; watch N+1 if volume grows.

---

## 5. Prioritized remediation roadmap

Issues opened from this audit (see GitHub) map to the following priority bands.

### P0 — Blockers for any claim of RS production readiness

| ID (local) | Title | Gate |
|------------|-------|------|
| [#227](https://github.com/NetHub-Ltd/NetHubKe/issues/227) | Enforce resource audience validation on access tokens | G1 |
| [#228](https://github.com/NetHub-Ltd/NetHubKe/issues/228) | Document and test IdP access-token profile (aud, azp, scopes, typ) | G1 |
| [#229](https://github.com/NetHub-Ltd/NetHubKe/issues/229) | Route authorization inventory + deny-by-default policy notes | G2 |

### P1 — Required before multi-product / multi-tenant production

| ID | Title | Gate |
|----|-------|------|
| [#230](https://github.com/NetHub-Ltd/NetHubKe/issues/230) | Organization membership model and query scoping | G2 |
| [#231](https://github.com/NetHub-Ltd/NetHubKe/issues/231) | Replace binary is_admin with scoped roles + auditable provisioning | G2 |
| [#232](https://github.com/NetHub-Ltd/NetHubKe/issues/232) | Security audit event stream for privileged and authz events | G4/G5 |
| [#233](https://github.com/NetHub-Ltd/NetHubKe/issues/233) | Threat model document | G0 |

### P2 — Central platform scope (subscription authority)

| ID | Title | Gate |
|----|-------|------|
| [#234](https://github.com/NetHub-Ltd/NetHubKe/issues/234) | Subscription domain model, lifecycle, and APIs | G3 |
| [#235](https://github.com/NetHub-Ltd/NetHubKe/issues/235) | Payment webhook integrity and idempotency | G3 |
| [#236](https://github.com/NetHub-Ltd/NetHubKe/issues/236) | Entitlement catalogue, evaluation, and product query API | G3 |

### P3 — Hardening and ops polish

| ID | Title |
|----|-------|
| [#237](https://github.com/NetHub-Ltd/NetHubKe/issues/237) | One-shot admin bootstrap + sanitize probe error bodies |
| — | Scope enforcement dependencies (once product scopes defined) — open when scopes exist |
| — | Staging E2E evidence pack against checklist G6 — operational |

---

## 6. Evidence register (code anchors)

| Area | Path | Symbol / note |
|------|------|---------------|
| JWT production decode | `apps/backend/app/core/security.py` | `decode_and_authorize_token`, `verify_aud: False` |
| Trusted clients | `apps/backend/app/crud/trusted_clients.py` | `is_client_trusted`, cache TTL |
| Auth dependencies | `apps/backend/app/api/deps.py` | `get_token_data`, `get_current_admin` |
| User identity | `apps/backend/app/crud/user.py` | `sync_user_from_token`, `_maybe_bootstrap_admin` |
| Models | `apps/backend/app/db/models/models.py` | `User`, `UserIdentity`, `Tenant`, `TrustedClient` |
| Migrations | `apps/backend/alembic/versions/` | identity + apps/trusted_clients |
| Application IDOR guard | `apps/backend/app/api/v1/routes/applications.py` | `app.user_id != user.id` |
| Admin routes | `apps/backend/app/api/v1/routes/admin.py` | trusted-clients CRUD, app status |
| Config | `apps/backend/app/core/config.py` | `audience`, `bootstrap_admin_emails`, JWKS |
| JWT unit tests | `apps/backend/tests/test_security.py` | helper with optional audience |
| Checklist | `docs/RESOURCE_SERVER_READINESS.md` | §3, §4, §6, §7, §18 |
| Integration contract | `docs/INTEGRATIONS.md` | trusted client semantics |

---

## 7. What this audit does **not** claim

- It does not implement the P0–P2 fixes (implementation issues are opened separately).
- It does not run staging soak against a live Zitadel issuer (G6 operational evidence remains open).
- It does not assert that production cluster configuration (TLS termination, secret manager, backup jobs) is correct — those are ops evidence items.

---

## 8. Recommended next actions for humans

1. Review and merge this documentation PR (audit report + tracker updates).
2. Prioritize **P0-1 (resource audience validation)** — small code change, high security value, aligns with checklist §18.
3. Schedule design review for organization membership + subscription domain before coding P1/P2.
4. Assign owners and evidence links on the checklist as items move to Verified.

---

## 9. Opened issues

| Issue | Priority | Title |
|-------|----------|-------|
| [#227](https://github.com/NetHub-Ltd/NetHubKe/issues/227) | P0 | Enforce resource audience validation on access tokens |
| [#228](https://github.com/NetHub-Ltd/NetHubKe/issues/228) | P0 | Document and test IdP access-token profile |
| [#229](https://github.com/NetHub-Ltd/NetHubKe/issues/229) | P0 | Route authorization inventory and deny-by-default notes |
| [#230](https://github.com/NetHub-Ltd/NetHubKe/issues/230) | P1 | Organization membership model and query scoping |
| [#231](https://github.com/NetHub-Ltd/NetHubKe/issues/231) | P1 | Replace binary is_admin with scoped roles and auditable provisioning |
| [#232](https://github.com/NetHub-Ltd/NetHubKe/issues/232) | P1 | Security audit event stream for privileged and authz events |
| [#233](https://github.com/NetHub-Ltd/NetHubKe/issues/233) | P1 | Threat model for Resource Server and subscription authority |
| [#234](https://github.com/NetHub-Ltd/NetHubKe/issues/234) | P2 | Subscription domain model, lifecycle, and APIs |
| [#235](https://github.com/NetHub-Ltd/NetHubKe/issues/235) | P2 | Payment webhook integrity and idempotency |
| [#236](https://github.com/NetHub-Ltd/NetHubKe/issues/236) | P2 | Entitlement catalogue, evaluation, and product query API |
| [#237](https://github.com/NetHub-Ltd/NetHubKe/issues/237) | P3 | One-shot admin bootstrap and sanitize probe error bodies |

*End of audit report.*

