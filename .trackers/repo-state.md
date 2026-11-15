# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master` (confirm with `git remote show origin`)
- Integration branch: `dev`
- Current topic branch: `docs/rs-readiness-audit-2026-11` (from `dev` at merge of PR #226)
- Current work: Resource Server readiness audit report + gap issues
- Audit report: `docs/RS_READINESS_AUDIT_REPORT.md`
- Readiness standard: `docs/RESOURCE_SERVER_READINESS.md` (merged via PR #226)

## Architecture posture

- NetHubKe is an IdP-agnostic OAuth 2.0 Resource Server.
- Does not issue product JWTs or operate as an Authorization Server.
- Central subscription and entitlement ownership is in scope (checklist supersedes historical A0–A6 deferral).

## Known critical gaps (see audit)

1. Production JWT path sets `verify_aud: False` — trusted-client check is not a substitute.
2. No organization membership model (nullable `tenant_id` only).
3. Binary `is_admin`; continuous bootstrap via `BOOTSTRAP_ADMIN_EMAILS` on sync.
4. Zero subscription/entitlement implementation.
5. No security audit event stream.

## Application baseline

- Backend: FastAPI, SQLModel, AsyncSession, Alembic (sync migrations), pytest.
- Frontend: Next.js App Router, Auth.js OIDC, BFF routes to resource server.
- Identity: `(issuer, subject)` unique; local user UUID PK.
- Trusted clients: DB registry + env bootstrap when empty.

## Previous workstream (complete / residual)

- Corporate UI/UX marketing audit: PR #224 merged; backend contact-enquiries endpoint may still be pending.
