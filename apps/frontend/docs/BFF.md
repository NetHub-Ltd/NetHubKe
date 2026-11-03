# Browser → Next.js BFF → NetHubKe API

## Security boundary

- Client components call same-origin `/api/nethub/*` routes only.
- Browser JavaScript never receives upstream access, refresh or ID tokens, product JWTs, machine credentials or the NetHubKe API origin.
- `BACKEND_URL` is server-only and used by `lib/server/backend.ts`.
- Auth.js stores upstream credentials in its encrypted session JWT cookie. The public session callback exposes only safe session/profile fields.
- BFF handlers read the encrypted cookie server-side through `lib/server/auth-session.ts`; they must not read bearer tokens from `useSession()` or public session JSON.
- Protected BFF routes require a successfully synchronized, active NetHubKe identity.
- Cookie-authenticated mutations require a same-origin Origin header, validate content type and input shape, and use explicit upstream paths. Do not add a generic proxy.

## Implemented BFF routes

| Browser route | NetHubKe operation | Notes |
|---|---|---|
| `GET /api/nethub/users/me` | `GET /api/v1/users/me` | Returns a filtered profile DTO |
| `PATCH /api/nethub/users/me` | `PATCH /api/v1/users/me` | Same-origin only; allows the display-name field |
| `GET /api/nethub/services/my-status` | `GET /api/v1/services/my-status` | Returns service status without upstream credentials |
| `GET /api/nethub/billing/summary` | `GET /api/v1/billing/summary` | Read-only billing summary |

## Disabled product exchange

`POST /api/nethub/auth/exchange` returns HTTP 410. It must not forward a product JWT to browser code. Product launch remains disabled until a one-time, short-lived launch code can be redeemed server-to-server by the product backend; see [LAUNCH_HOP.md](./LAUNCH_HOP.md).

## Validation

Frontend CI must run lint and production build. Add/maintain route-level tests for cookie decoding, provisioned-user requirements, same-origin mutation checks, safe DTOs and upstream failure handling.
