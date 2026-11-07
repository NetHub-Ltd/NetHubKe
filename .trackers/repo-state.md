# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Integration branch: `dev`
- `dev` created from `master` at commit `01969ef693b1acc2c25d07e12b19d03d93e7b0bb`.
- Current topic branch: `feat/corporate-uiux-marketing-audit`, created from `dev`.
- Current workstream: corporate-site UI/UX, positioning, trust, conversion, design system, SEO, and accessibility.
- Current proposal: `docs/UIUX-MARKETING-IMPLEMENTATION-PROPOSAL.md`.
- PR target: `dev`.
- Implementation status: documentation and planning only; no application code changed yet.

## Application baseline

- Frontend: Next.js 16.4.5, React 19.3.1, TypeScript, Tailwind CSS 3.
- Linting: ESLint 10.14.0 with `eslint-config-next` 16.4.5 native flat config; `npm run lint` executes `eslint .`.
- Minimum Node.js version is 20.19.0; frontend CI runs Node.js 22 with `npm ci`, lint, TypeScript typecheck and production build.
- Auth.js generic OIDC, PKCE/state cookies, server-side token handling, BFF routes and NetHubKe integration are established contracts.

## Corporate-site baseline

- Corporate-site foundation was delivered through PR #206.
- Typography, surface, and login polish were delivered through PR #209.
- Homepage positioning, service discovery, and conversion work were merged through PR #213/#214.
- Issue #212 remains relevant for corporate-site positioning, conversion, and search-discovery follow-up.
- The current workstream builds on this baseline rather than duplicating completed work.

## Current scope boundaries

- Corporate website UI/UX and marketing only.
- No Tawala or NetPay product development.
- No backend, authentication, OIDC, database, or infrastructure changes.
- No invented testimonials, metrics, client names, certifications, or outcome claims.
- PRs must target `dev`; do not push directly to `dev` or `master`.

## Verification expectations

- Node.js 22; `npm ci`, `npm run lint`, TypeScript typecheck, and production build.
- Review semantic HTML, metadata, responsive behavior, keyboard navigation, focus visibility, and form states.
- Do not claim browser visual review or production deployment unless actually verified.
