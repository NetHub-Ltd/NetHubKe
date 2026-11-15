# Subscriptions, entitlements, and payment webhooks

NetHubKe is the **central subscription and entitlement authority** for NetHub products. Product apps enforce capabilities locally; they query NetHubKe for the grant set.

---

## Domain model

| Entity | Purpose |
|--------|---------|
| **Plan** | Product + code (e.g. `tawala` / `pro`) with trial days |
| **PlanEntitlement** | Capability rows on a plan (`tawala.inventory.manage`, …) |
| **Subscription** | One row per `(organization_id, product)` with lifecycle status and period |
| **EntitlementOverride** | Explicit org/product capability override (wins over plan) |
| **PaymentEvent** | Idempotent webhook receipt (no cardholder data) |

### Subscription statuses

| Status | Entitlements effective? |
|--------|---------------------------|
| `trial` | Yes, until `current_period_end` |
| `active` | Yes, until `current_period_end` |
| `past_due` | No (request-time) |
| `canceled` | No |
| `suspended` | No |

Evaluation is **request-time**: status ∈ {trial, active} **and** `current_period_end > now`. Async jobs may update rows later; API decisions do not wait for them.

---

## APIs

### Plan catalog (public)

```http
GET /api/v1/plans
GET /api/v1/plans?product=tawala
```

Dev/staging may seed default Tawala/NetPay starter/pro plans on first catalog read.

### Organization subscriptions (member)

```http
GET /api/v1/organizations/{organization_id}/subscriptions
Authorization: Bearer <access-token>
```

Non-members receive **404**.

### Entitlements (member)

```http
GET /api/v1/organizations/{organization_id}/entitlements?product=tawala
Authorization: Bearer <access-token>
```

Response shape:

```json
{
  "organization_id": "…",
  "product": "tawala",
  "subscription_status": "active",
  "subscription_effective": true,
  "capabilities": [
    {
      "capability": "tawala.inventory.manage",
      "value_type": "boolean",
      "value": "true",
      "source": "plan"
    }
  ]
}
```

`source` is `plan` or `override`. Clients must not treat missing capabilities as granted.

### Admin trial grant

```http
POST /api/v1/admin/organizations/{organization_id}/subscriptions/trial
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{ "product": "tawala", "plan_code": "pro" }
```

Ordinary clients **cannot** set subscription status or price fields.

### Payment webhook

```http
POST /api/v1/webhooks/payments/{provider}
Content-Type: application/json
X-NetHub-Signature: sha256=<hex hmac sha256 of raw body>
```

Example body (placeholders):

```json
{
  "event_id": "evt_123",
  "idempotency_key": "idem_123",
  "event_type": "payment.succeeded",
  "organization_id": "00000000-0000-0000-0000-000000000000",
  "product": "netpay",
  "plan_code": "starter",
  "amount_cents": 150000,
  "currency": "KES"
}
```

| Rule | Behaviour |
|------|-----------|
| Missing/invalid signature | **401**, no state change |
| Duplicate `event_id` / `idempotency_key` | Returns original event; **does not** double-extend period |
| `payment.succeeded` / `subscription.renewed` | Activates or renews subscription (~30 day period) |
| Other event types | Recorded as `ignored` |
| Unknown plan | `failed` |

HMAC secret: `PAYMENT_WEBHOOK_SECRET`. **Never** activate a subscription from a browser return URL alone.

---

## Capability naming

Use stable, namespaced identifiers:

- `tawala.inventory.view`
- `tawala.inventory.manage`
- `netpay.payments.accept`

Value types: `boolean`, `quota`, `enum` (string-encoded values).

---

## Security notes

- Webhooks store `payload_hash`, never raw PAN/CVV.
- Cross-org reads of subscriptions/entitlements are denied (404).
- Audit events fire on trial grant and payment activation/renewal.
