# NetHub frontend

The Next.js App Router application serves two roles:

1. The public NetHub corporate website.
2. An authenticated client of NetHubKe, using the existing Auth.js/OIDC flow.

## Public website

The corporate website positions NetHub as a business growth partner powered by technology.

| Route | Purpose |
|---|---|
| `/` | Home |
| `/services` | Services |
| `/products` | Upcoming Tawala and NetPay products |
| `/about` | About NetHub |
| `/contact` | Business enquiries |

See [Corporate website notes](../../docs/CORPORATE_WEBSITE.md) for positioning, design tokens, SEO and contact configuration.

## Authentication flow (preserved)

1. User signs in via Auth.js generic OIDC (`AUTH_OIDC_*`).
2. IdP access token is stored in the Auth.js JWT on the server.
3. BFF/server components call NetHubKe using the original IdP access token:

   `Authorization: Bearer <IdP access token>`

   - `POST /api/v1/users/sync`
   - `GET /api/v1/users/me`

There is no product-token exchange. The website remains a client of NetHubKe.

## Application routes

| Path | Role |
|---|---|
| `/login` | OIDC sign-in |
| `/dashboard` | Redirects to `/dashboard/me` |
| `/dashboard/me` | Authenticated profile from NetHubKe (server-side BFF call) |
| `/me` | Compatibility redirect to `/dashboard/me` |
| `/api/bff/me` | JSON BFF |
| `/api/bff/sync` | JSON BFF |
| `/api/auth/*` | Auth.js |

The dashboard layout verifies the Auth.js session before rendering. The Next.js 16 `src/proxy.ts` performs an optimistic cookie-presence redirect only; it does not validate sessions or replace the layout guard.

## Framework and runtime

- Next.js 16.x
- React 19
- Node.js 20.9 or later
- ESLint CLI (`npm run lint`)

## Configure

Copy `.env.example` to `.env.local` and configure the OIDC and NetHubKe values.

- `NEXT_PUBLIC_SITE_URL`: public canonical website origin.
- `NEXT_PUBLIC_CONTACT_EMAIL`: enquiry inbox; configured as `hello@nethub.co.ke` in the example environment.
- `AUTH_URL`, `AUTH_SECRET`, `AUTH_OIDC_*`: existing Auth.js configuration.
- `NETHUB_API_URL`: NetHubKe resource server URL.

The contact form opens a pre-addressed email draft to the configured inbox. The visitor must send it from their email client; the website does not submit or store the enquiry.

```bash
npm ci
npm run dev
```

## Auth.js PKCE / InvalidCheck

If login fails with `InvalidCheck: pkceCodeVerifier value could not be parsed`:

1. `AUTH_URL` must be the exact public origin users use.
2. `AUTH_SECRET` must be stable across the authorize → callback round-trip (same value on all instances).
3. Clear site cookies for the domain and try once (stale PKCE cookie from a previous secret).
4. IdP redirect URI must be `https://<host>/api/auth/callback/oidc`.
5. Auth routes use the Node.js runtime (not Edge) so cookie encryption matches.
