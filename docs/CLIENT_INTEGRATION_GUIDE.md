# Client integration guide (website, Tawala, NetPay)

This is the practical how-to for any NetHub product client that calls the NetHubKe **resource server**.

Related: [INTEGRATIONS.md](./INTEGRATIONS.md) · [IDP_TOKEN_PROFILE.md](./IDP_TOKEN_PROFILE.md) · [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md) · [AUTHZ_MATRIX.md](./AUTHZ_MATRIX.md)

---

## 1. Prerequisites

1. **IdP application** registered for your client (SPA, native, or backend).
2. Access tokens issued for your users include:
   - `aud` containing NetHubKe’s configured **resource audience** (`RESOURCE_AUDIENCE`)
   - `azp` or `client_id` identifying your OIDC client
   - `sub`, `exp`, preferably `email` on first login
3. Your client id is registered in NetHubKe **trusted_clients** (admin API or bootstrap `AUDIENCE` when empty).
4. Base URL of the API (example only): `https://api.example.com`

---

## 2. Token acquisition (client responsibility)

Use the IdP’s standard OIDC/OAuth authorization code + PKCE (or client-credentials for pure machine clients when supported).

**Present only access tokens** to NetHubKe. Do not send ID tokens as Bearer credentials.

```http
Authorization: Bearer <idp-access-token>
Accept: application/json
```

---

## 3. First-time user provisioning

```http
POST /api/v1/users/sync
Authorization: Bearer <token>
```

Then:

```http
GET /api/v1/users/me
```

If `me` returns 404, call `sync` again. Profile updates:

```http
PATCH /api/v1/users/me
Content-Type: application/json

{ "full_name": "Ada Lovelace", "username": "ada" }
```

`is_admin` is **not** writable by the client.

---

## 4. Organizations

```http
POST /api/v1/organizations
{ "name": "Acme Ltd", "slug": "acme-ltd" }
```

Caller becomes **owner**. List memberships:

```http
GET /api/v1/organizations
```

Membership management (owner/admin):

```http
POST /api/v1/organizations/{id}/members
{ "user_id": "<uuid>", "role": "member" }

DELETE /api/v1/organizations/{id}/members/{user_id}
```

Cross-organization access returns **404**.

---

## 5. Subscriptions and entitlements

List plans:

```http
GET /api/v1/plans?product=tawala
```

Read org subscription state (must be a member):

```http
GET /api/v1/organizations/{org_id}/subscriptions
```

Evaluate capabilities for a product:

```http
GET /api/v1/organizations/{org_id}/entitlements?product=tawala
```

**Product enforcement pattern:**

1. Call entitlements (cache briefly if needed; honour suspension quickly).
2. Allow or deny product features from the capability list.
3. On payment success, rely on **provider → NetHubKe webhook**, not the browser redirect.

Trial grants are **admin-only**:

```http
POST /api/v1/admin/organizations/{org_id}/subscriptions/trial
{ "product": "tawala", "plan_code": "pro" }
```

---

## 6. Payment provider webhook (server-to-server)

Providers (or your billing adapter) POST to:

```http
POST /api/v1/webhooks/payments/{provider}
X-NetHub-Signature: sha256=<hmac_sha256_hex(raw_body, PAYMENT_WEBHOOK_SECRET)>
Content-Type: application/json
```

Required JSON fields for activation: `event_id`, `idempotency_key`, `event_type`, `organization_id`, `product`, `plan_code`.

Duplicates are safe. Invalid signatures yield 401.

---

## 7. Website / BFF pattern (reference)

The corporate site uses Auth.js for OIDC, then server-side BFF routes call NetHubKe with the access token. The browser never needs a NetHubKe-minted product JWT (there is none).

See `apps/frontend/src/lib/backend.ts` and `apps/frontend/src/app/api/bff/*`.

---

## 8. Error handling cheat sheet

| HTTP | Typical cause |
|------|----------------|
| 401 | Missing/invalid token, wrong audience, untrusted client, bad webhook signature |
| 403 | Inactive user, non-admin on admin route, insufficient org role |
| 404 | Not provisioned; or resource not found / not a member (no cross-tenant leak) |
| 409 | Email identity conflict; subscription already active; slug taken |
| 429 | Rate limit |

Never log full bearer tokens.

---

## 9. Checklist for a new product client

- [ ] IdP client configured; access token audience includes NetHubKe
- [ ] Client id in `trusted_clients`
- [ ] Sync + me works in staging
- [ ] Org create/membership tested
- [ ] Plans exist for your `product` code
- [ ] Entitlement query integrated in product authorization path
- [ ] Payment webhook signed and idempotent in staging
- [ ] No reliance on browser “payment success” alone
