Detailed product client how-to: [CLIENT_INTEGRATION_GUIDE.md](./CLIENT_INTEGRATION_GUIDE.md).

# NetHubKe integrations

How **any** client (website, Tawala, NetPay, future apps) talks to the NetHubKe **resource server**.

This document uses **placeholders only**. Do not put real client IDs, secrets, emails, or host credentials in git.

---

## Architecture contract

NetHubKe is an **IdP-agnostic resource server**.

| Does | Does not |
|------|----------|
| Accept an **IdP** access token (`Authorization: Bearer …`) | Mint a second “product” JWT |
| Validate signature, issuer, expiry, resource audience, trusted client | Act as the login UI / Authorization Server |
| Resolve local user by `(issuer, subject)` | Require a vendor-specific SDK |
| Return JSON (profile, services, applications, …) | Special-case Tawala vs NetPay vs website |

Switch IdP by **configuration** (`OIDC_ISSUER`, JWKS). All product clients use the **same** integration pattern.

---

## Shared client flow

```text
1. User signs in at the configured OIDC IdP
2. Client obtains an IdP access token
3. Client calls NetHubKe:
     Authorization: Bearer <idp-access-token>
4. NetHubKe validates the token, checks trusted client, resolves user
5. Client uses the JSON response — not a NetHubKe-issued token
```

### First-time user

1. `POST /api/v1/users/sync` — create or update local user from claims  
2. `GET /api/v1/users/me` — read profile  

Subsequent calls may use `GET /me` only; if `404`, call `sync` again.

### Resource audience and trusted clients

Validation is **two-step** after signature and issuer checks. Full claim contract: [IDP_TOKEN_PROFILE.md](./IDP_TOKEN_PROFILE.md).

**1. Resource audience (`RESOURCE_AUDIENCE`)**

Token `aud` must intersect the configured NetHubKe API audience list. Required in staging/production (fail closed if unset). This answers: *was this token minted for this resource server?*

**2. Trusted calling client**

The token’s `azp` and/or `client_id` must match an **active** row in `trusted_clients`. This answers: *is the calling client registered?*

| Situation | Behaviour |
|-----------|-----------|
| Wrong or missing resource audience | `401` (even if client is trusted) |
| Correct audience, client missing or revoked | `401` client-not-authorized |
| Table empty + `AUDIENCE` env set | Trusted-client rows bootstrapped from env (OIDC client ids only — not a substitute for `RESOURCE_AUDIENCE`) |
| Client active + audience OK | Request proceeds |

Register or revoke clients via **admin API** (admin user required). Prefer DB management over long-term reliance on env bootstrap.

**Do not** publish production client IDs in public docs or issues.

Route protection inventory: [AUTHZ_MATRIX.md](./AUTHZ_MATRIX.md).

---

## Base URL

Use your deployed API origin (example shapes only):

| Environment | Example shape |
|-------------|----------------|
| Local | `http://127.0.0.1:8000` |
| Production | `https://api.example.com` |

Discover live OpenAPI at `{base}/docs` and `{base}/openapi.json` when exposed.

---

## Authentication header

```http
Authorization: Bearer <idp-access-token>
Content-Type: application/json
Accept: application/json
```

Token requirements:

- Issued by configured `OIDC_ISSUER` (exact issuer string after normalization)
- Valid signature against IdP JWKS
- Not expired (`exp`), subject present (`sub`)
- Resource audience: `aud` intersects `RESOURCE_AUDIENCE` (required in staging/production)
- Calling client: `azp` / `client_id` trusted (see above)
- Prefer tokens that include `email` on first `sync` (provisioning)
- Use an **access token**, not an ID token

See [IDP_TOKEN_PROFILE.md](./IDP_TOKEN_PROFILE.md).

---

## Public and authenticated routes (summary)

Canonical detail: **OpenAPI**. Summary for integrators:

### Unauthenticated

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/ready` | Database readiness |
| GET | `/api/v1/services` | Catalog of services that accept quote requests |

### Authenticated (Bearer)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/users/sync` | Provision / refresh user |
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update profile fields |
| POST | `/api/v1/organizations` | Create organization (caller = owner) |
| GET | `/api/v1/organizations` | List organizations for current user |
| GET | `/api/v1/organizations/{id}` | Organization detail (members only) |
| GET/POST/DELETE | `/api/v1/organizations/{id}/members…` | Membership management |
| POST | `/api/v1/applications` | Submit a quote / proposal request |
| GET | `/api/v1/applications` | List current user’s requests |
| GET | `/api/v1/applications/{id}` | Request detail + messages |
| POST | `/api/v1/applications/{id}/messages` | User message on own request |

See [AUTHZ_MATRIX.md](./AUTHZ_MATRIX.md) for protection classes.

### Admin (Bearer + platform `is_admin`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/applications` | All quote requests |
| GET | `/api/v1/admin/applications/{id}` | Detail |
| POST | `/api/v1/admin/applications/{id}/messages` | Staff reply |
| PATCH | `/api/v1/admin/applications/{id}` | Status (`submitted` \| `in_review` \| `quoted` \| `closed`) |
| GET/POST | `/api/v1/admin/trusted-clients` | List / register client ids |
| POST | `/api/v1/admin/trusted-clients/{client_id}/revoke` | Revoke mid-lifecycle |
| POST | `/api/v1/admin/users/{user_id}/platform-admin` | Explicit grant/revoke platform admin (audited) |

Platform admin bootstrap: `BOOTSTRAP_ADMIN_EMAILS` elevates matching users **only on first provision**, not on every sync. Prefer the explicit admin API afterward. Do not commit real addresses.

### Diagnostics

`GET /diagnostics` is for operators. In production it should remain disabled unless explicitly enabled. Treat output as internal (issuer, db ok flags) — still avoid putting secrets in responses.

---

## Error expectations

| HTTP | Typical meaning |
|------|-----------------|
| 401 | Missing/invalid/expired token, or client not trusted |
| 403 | Inactive user, or admin route without admin |
| 404 | User not synced yet; or application not found / not owned |
| 409 | Email already linked to another identity |
| 429 | Rate limit exceeded |

Clients should not log full bearer tokens.

---

## Product boundaries

| Product | Integration |
|---------|-------------|
| Corporate website | Same Bearer API; quote flow via applications |
| Tawala, NetPay | Same Bearer API for identity; **not** entries in the public quote catalog |
| Future apps | Register OIDC client in `trusted_clients`; call the same routes as needed |

---

## Security notes for integrators

- Store IdP client **secrets** only in the client’s secret manager — NetHubKe validates tokens, it does not hold SPAs’ client secrets for public clients.
- Prefer short-lived access tokens; revocation of a trusted client applies on subsequent API calls (cache TTL may delay by a short window).
- CORS is allowlist-based (`ALLOWED_ORIGINS`); browser apps must use allowed origins.
- Never paste production tokens, JWKS private material, DB passwords, or bootstrap admin lists into tickets or docs.
