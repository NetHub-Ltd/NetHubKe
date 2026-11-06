# NetHubKe API reference (summary)

**Canonical specification:** the running service’s OpenAPI document.

- Interactive: `{API_BASE}/docs`
- Machine-readable: `{API_BASE}/openapi.json`

This file is a **sanitized overview** for humans. It does not replace OpenAPI and must not contain real credentials, client IDs, or personal data.

---

## Service identity

| Item | Value |
|------|--------|
| Style | REST JSON over HTTPS |
| Auth | OIDC access token as Bearer (resource server) |
| User key | `(issuer, subject)` via `user_identities` |
| Token issuance | **None** (no product JWT) |

---

## Route groups

1. **Probes** — `/health`, `/ready`  
2. **Users** — `/api/v1/users/*`  
3. **Services** — `/api/v1/services`  
4. **Applications** — `/api/v1/applications/*`  
5. **Admin** — `/api/v1/admin/*`  

See [INTEGRATIONS.md](./INTEGRATIONS.md) for client flow and trusted-client rules.

---

## Profile payload (illustrative)

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "email": "user@example.com",
  "username": "user",
  "full_name": "Example User",
  "is_active": true,
  "is_admin": false,
  "tenant_id": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

Placeholders only.

---

## Application create (illustrative)

```json
{
  "service_slug": "website-development-kenya",
  "title": "Company website",
  "body": "We need a clear site with contact and services pages.",
  "budget_band": "",
  "timeline": "",
  "contact_phone": ""
}
```

`body` must meet server validation (minimum length enforced).

---

## Versioning

Routes are under `/api/v1`. Breaking changes require a new version prefix or a documented migration — do not silently break clients.
