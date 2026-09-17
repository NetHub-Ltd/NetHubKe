# Launch hop (N7)

Feature-flagged flow: NetHub console → product token exchange → product app.

## Enable

```bash
NEXT_PUBLIC_LAUNCH_HOP_ENABLED=true
NEXT_PUBLIC_TAWALA_LAUNCH_URL=https://<tawala-host>/auth/hard-session
NEXT_PUBLIC_BACKEND_URL=https://<nethub-api>
```

Backend must have `TAWALA_EXCHANGE_ENABLED=true` and signing keys ready.

## Flow

1. User clicks **Launch** on My services (connected/trial).
2. Browser `POST /api/v1/auth/exchange` with `{ "product": "tawala" }` and Keycloak bearer token.
3. On success, redirect to `TAWALA_LAUNCH_URL` with token in the **hash**  
   (`#access_token=...&org_id=...&principal=...`).
4. On failure, error is shown under the button (no redirect).

## Flag off

Launch control shows “Launch soon”; no exchange calls.
