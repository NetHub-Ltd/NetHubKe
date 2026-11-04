# NetHub frontend

The Next.js App Router application serves two roles:

1. The public NetHub corporate website.
2. A small authenticated client that demonstrates the existing Auth.js/OIDC and NetHubKe integration.

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
| `/me` | Profile from NetHubKe (server-side BFF call) |
| `/api/bff/me` | JSON BFF |
| `/api/bff/sync` | JSON BFF |
| `/api/auth/*` | Auth.js |

## Configure

Copy `.env.example` to `.env.local` and configure the OIDC and NetHubKe values.

- `NEXT_PUBLIC_SITE_URL`: public canonical website origin.
- `NEXT_PUBLIC_CONTACT_EMAIL`: verified enquiry inbox used by the contact email-draft handoff.
- `AUTH_URL`, `AUTH_SECRET`, `AUTH_OIDC_*`: existing Auth.js configuration.
- `NETHUB_API_URL`: NetHubKe resource server URL.

The contact form does not submit data to a server. It opens an email draft and clearly tells the visitor to send it. Do not describe this as server-side lead capture.

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
