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
