# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Integration branch: `dev`
- Current topic branch: `feat/site-discovery-conversion-review`
- Topic branch base: `dev` at `19a2f6241df073b51d07de502b8f93fe48059be4`
- Current task: corporate site positioning, service discovery, conversion and SEO improvements.
- Related issue: #212.
- Delivery: one PR targeting `dev`; do not merge without user approval.

## Concurrent work

- PR #211 (`feat/site-visual-login-polish`) is separate and was not used as this branch's base.
- This branch avoids changes to root layout/global typography/login/auth so it can be reviewed independently and reduce overlap with PR #211.

## Relevant application baseline

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 3.
- Public routes: home, services, products, about, contact, plus static service detail routes.
- Auth.js/OIDC, PKCE/state cookies, BFF token forwarding and NetHubKe integration must remain unchanged.

## Scope boundary

- Public marketing content, service route content, metadata, sitemap and trackers only.
- No database, backend API, authentication, token handling, BFF or infrastructure changes.
