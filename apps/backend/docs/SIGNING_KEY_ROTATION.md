# Signing key rotation (N5)

NetHubKe issues product access tokens with managed RSA keys in `signing_keys`.

## Lifecycle

| Status | Used to sign new tokens | In JWKS |
|--------|-------------------------|---------|
| `active` | yes | yes |
| `retiring` | no | yes until `retire_after` |
| `retired` | no | no |

## Rotate (ops)

```http
POST /api/v1/ops/signing-keys/rotate
Authorization: Bearer <Keycloak token with admin|super_admin|ops role>
Content-Type: application/json

{ "retire_after_hours": 24 }
```

Effects:

1. Current `active` key(s) → `retiring` with `retire_after = now + hours`
2. New RSA key inserted as `active`
3. Redis caches `nethub:as:jwks` and `nethub:as:signing:active_kid` purged

Public JWKS (`GET /api/v1/auth/jwks.json`) returns **active + retiring** so verifiers can validate tokens signed with the old kid during overlap.

## Prune

```http
POST /api/v1/ops/signing-keys/prune
```

Marks retiring rows with `retire_after <= now` as `retired` and purges JWKS cache.

Schedule this as a cron/job if desired; rotate alone is enough for dual publish during the window.

## Security

- Private PEMs never leave NetHubKe / this database.
- Rotation requires elevated Keycloak roles (`admin`, `super_admin`, or `ops`) plus `user:write` scope.
