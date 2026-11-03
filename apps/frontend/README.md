# NetHubKe frontend (Architecture A)

Bare-minimum **Next.js** app with a **BFF** to the NetHubKe resource server.

## Flow

1. User signs in via **Auth.js** generic OIDC (`AUTH_OIDC_*`).
2. IdP **access token** stored in the Auth.js JWT (server-side).
3. BFF / server components call NetHubKe:

   `Authorization: Bearer <IdP access token>`

   - `POST /api/v1/users/sync`
   - `GET /api/v1/users/me`

Same contract as Tawala, NetPay, and any other API client. **No product-token exchange.**

## Routes

| Path | Role |
|------|------|
| `/` | Home + session status |
| `/login` | OIDC sign-in |
| `/me` | Profile from NetHubKe (server-side BFF call) |
| `/api/bff/me` | JSON BFF |
| `/api/bff/sync` | JSON BFF sync |
| `/api/auth/*` | Auth.js |

## Configure

Copy `.env.example` → `.env.local` and set OIDC + `NETHUB_API_URL`.

```bash
npm install
npm run dev
```


## Auth.js PKCE / InvalidCheck

If login fails with `InvalidCheck: pkceCodeVerifier value could not be parsed`:

1. **AUTH_URL** must be the exact public origin users use (e.g. `https://nethub.co.ke`).
2. **AUTH_SECRET** must be stable across the authorize → callback round-trip (same value on all instances).
3. Clear site cookies for the domain and try once (stale PKCE cookie from a previous secret).
4. IdP redirect URI must be `https://<host>/api/auth/callback/oidc`.
5. Auth routes use the **Node.js** runtime (not Edge) so cookie encryption matches.
