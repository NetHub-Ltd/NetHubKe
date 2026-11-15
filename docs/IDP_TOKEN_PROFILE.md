# IdP access-token profile (NetHubKe Resource Server)

**Purpose:** Pin the token contract NetHubKe accepts so IdP configuration, product clients, and the resource server stay aligned.

**Related:** [INTEGRATIONS.md](./INTEGRATIONS.md), [RESOURCE_SERVER_READINESS.md](./RESOURCE_SERVER_READINESS.md) §3, issues #227 / #228.

This document uses **placeholders only**. Do not commit real client IDs or issuer hostnames beyond what is already public.

---

## Role of NetHubKe

NetHubKe is an **OAuth 2.0 Resource Server**. It:

- Accepts **access tokens** issued by the configured external IdP
- Does **not** accept ID tokens as API credentials
- Does **not** mint product JWTs or refresh tokens

---

## Required cryptographic checks

| Check | Behaviour |
|-------|-----------|
| Transport | Bearer tokens only over TLS in deployed environments |
| Signature | Verify against IdP JWKS (`OIDC_JWKS_URL` or `{OIDC_ISSUER}/oauth/v2/keys`) |
| Algorithms | Allowlist: `RS256`, `ES256` only (`none` rejected) |
| Issuer (`iss`) | Exact match to configured `OIDC_ISSUER` (trailing slash normalized) |
| Expiry (`exp`) | Required; rejected when expired (configurable leeway via `JWT_LEEWAY_SECONDS`) |
| Subject (`sub`) | Required; treated as opaque **string** (Zitadel-style large integers remain strings) |

Fail closed: JWKS or infrastructure errors yield `401`, never an unverified principal.

---

## Resource audience vs calling client

These are **two different controls**:

| Control | Claim(s) | Config | Purpose |
|---------|----------|--------|---------|
| **Resource audience** | `aud` | `RESOURCE_AUDIENCE` (comma-separated) | Token was minted **for this API** |
| **Trusted client** | `azp`, `client_id` | `trusted_clients` table (+ optional `AUDIENCE` bootstrap) | Calling **client** is registered and active |

### Resource audience (`RESOURCE_AUDIENCE`)

- Token `aud` (string or list) must **intersect** the configured list.
- Required in **staging** and **production**. If unset there, all tokens are rejected.
- In **development**, an empty list allows a legacy path (trusted-client may still use `aud` as a client identifier). Do not rely on that in deployed environments.
- Example value shape: `nethubke-api` (choose a stable API resource identifier in the IdP and keep it stable).

### Trusted client

- After audience validation, NetHubKe requires at least one of `azp` / `client_id` (preferred) to match an **active** row in `trusted_clients`.
- When resource-audience mode is active, `aud` is **not** used as a client identity (it is the API resource id).
- Revocation: admin API sets `is_active=false` / `revoked_at`; cache TTL bounds propagation (see `TRUSTED_CLIENTS_CACHE_TTL`).

---

## Optional / informational claims

| Claim | Use |
|-------|-----|
| `email` | Preferred on first `POST /api/v1/users/sync` for provisioning |
| `name`, `preferred_username` | Profile fields on sync |
| `scope` / `scp` | Parsed into `TokenData.scopes`; **not yet enforced per-route** (future) |
| `roles` / `realm_access.roles` | Parsed; authorization today uses local `User.is_admin`, not token roles |

---

## Access token vs ID token

| Token type | Accepted as Bearer for API? |
|------------|-----------------------------|
| IdP **access token** intended for NetHubKe (`aud` includes resource audience) | Yes |
| **ID token** | No — clients must present the access token |

Configure the IdP application so access tokens include the NetHubKe resource audience and the client’s `azp` / `client_id`.

---

## IdP configuration checklist (operators)

1. Create / select an API resource or audience value for NetHubKe; set `RESOURCE_AUDIENCE` to the same value(s).
2. Register each product client (website, Tawala, NetPay, …) in the IdP.
3. Ensure access tokens for those clients include NetHubKe in `aud` and the client id in `azp` or `client_id`.
4. Register the same client ids in NetHubKe `trusted_clients` (admin API or `AUDIENCE` bootstrap when empty).
5. Prefer short-lived access tokens; do not log bearer values.

---

## Error semantics (clients)

| HTTP | Meaning |
|------|---------|
| 401 | Missing/malformed/expired token, wrong issuer/signature, wrong resource audience, untrusted client, or misconfigured `RESOURCE_AUDIENCE` in staging/production |
| 403 | Authenticated but not permitted (e.g. inactive user, non-admin on admin routes) |

Clients must not log full bearer tokens.

---

## Change control

Any change to required claims, audience semantics, or trusted-client rules must update this document, [INTEGRATIONS.md](./INTEGRATIONS.md), and automated tests in the same change.
