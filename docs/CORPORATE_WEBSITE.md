# NetHub Corporate Website

## Purpose

The public website positions NetHub as a business growth partner powered by technology. It explains how NetHub helps businesses improve their digital presence, customer experience, operations and use of technology.

The site should communicate business outcomes in customer language. Internal identity-provider, token and resource-server implementation details belong in engineering documentation, not the public marketing journey.

## Public routes

| Route | Purpose |
|---|---|
| `/` | Corporate value proposition and primary conversion path |
| `/services` | Service catalogue and entry point to focused service pages |\n| `/services/[slug]` | Search-focused pages for website development, mobile apps, SEO/conversion and business technology |
| `/products` | Upcoming Tawala and NetPay products |
| `/about` | NetHub purpose and working principles |
| `/contact` | Business enquiry context and contact handoff |

The `/login`, `/me` and `/api/*` routes remain application/authentication surfaces. Their authentication behavior is intentionally unchanged.

## Visual direction

Approved direction: **Growth Partner + Hybrid**.

- Light-first warm neutral page surfaces.
- Deep charcoal typography and a confident blue primary action.
- Dark sections reserved for product storytelling and high-contrast calls to action.
- Cyan is a restrained supporting accent.
- Inter and Space Grotesk remain the font families.
- Shared semantic tokens live in `src/app/globals.css`; Tailwind maps them in `tailwind.config.js`.

Do not introduce one-off page palettes or add a design dependency without a concrete need.

## Product messaging

- **Tawala** is presented as upcoming business management software.
- **NetPay** is presented as upcoming payment infrastructure within the NetHub product ecosystem.
- Neither product has a public launch date, pricing or general-availability claim on this site.

## SEO

- `NEXT_PUBLIC_SITE_URL` defines the canonical production origin and metadata base. The repository's existing Auth.js example uses `https://nethub.co.ke`; override the variable if the confirmed public canonical host differs.
- `/sitemap.xml` lists only the public marketing routes.
- `/robots.txt` allows public crawling and disallows application/API routes.
- Organization JSON-LD contains only the company name, URL and approved description. Do not add address, telephone, logo, ratings or social profiles until verified.
- Public page metadata is defined alongside each route. Each focused service page has its own canonical URL and is included in the sitemap from the shared service catalogue.

## Contact handoff

The public enquiry inbox is **hello@nethub.co.ke**. It is configured through `NEXT_PUBLIC_CONTACT_EMAIL` in `apps/frontend/.env.example` and must also be set in the frontend deployment environment.

The contact form prepares an email draft in the visitor's email application. The visitor must review and send it. This website does not receive or store the enquiry, and the UI must not claim that NetHub received a message merely because the email draft opened.

A server-side delivery mechanism is not currently configured. Introduce one only if the business later approves a receiving provider and server-side lead capture.

## Authentication boundary

The existing Auth.js generic OIDC provider, PKCE/state cookies, server-side token handling, BFF routes and NetHubKe integration are not part of this website redesign. Preserve these contracts and keep the Node runtime on the Auth.js route.

## Local checks

From `apps/frontend`:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

The frontend CI workflow runs these gates on pull requests targeting `dev`.
