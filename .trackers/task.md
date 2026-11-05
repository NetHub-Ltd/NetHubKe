# Task — NetHub Corporate Site Discovery & Conversion

## Status

- **Corporate website foundation:** completed and merged in PR #206.
- **Typography, surface and login polish:** merged into `dev` through PR #209.
- **Corporate-site discovery and conversion:** completed and merged through PR #213 (to `dev`) and PR #214 (to `master`).
- **Typography, surface and login polish:** completed and merged through PR #211/#214.
- **Latest production redeploy trigger:** PR #215 merged to `master`.
- **Current follow-up:** move the merged account profile into `/dashboard/me`, introduce a reusable dashboard shell, and upgrade the frontend to Next.js 16 on `feat/dashboard-shell-next16`, targeting `master`.
- **Current branch base:** `master` at `ee768708b65c114413fc1f65aed1c99048af8bc6`.
- PR #216 was merged; do not merge the current follow-up PR without user approval.

## Approved direction

Growth Partner + Hybrid:
- Light-first warm neutral pages with the approved blue/cyan gradient and typography.
- Deep navy/dark feature sections selectively.
- NetHub is positioned as a business growth partner powered by technology.
- Public messaging focuses on business problems and outcomes, not identity-provider internals.

## Relevant issues

- #201 — visual system and shared shell (delivered in PR #206).
- #202 — home, services and about (delivered in PR #206; follow-up discovery work in #212).
- #203 — upcoming Tawala and NetPay showcases (delivered in PR #206).
- #204 — business enquiry journey (delivered in PR #206; follow-up contact clarity in #212).
- #205 — technical SEO and public-site quality (delivered in PR #206; service discovery expansion in #212).
- #208 — typography, surface elevation and login polish (merged through PR #209).
- #212 — improve corporate site positioning, conversion and search discovery (current task).

## Review scope

Review the public corporate website as a business acquisition and search-discovery experience:
- Positioning and audience clarity.
- Service discovery and search intent.
- Content hierarchy and enquiry conversion.
- Trust and credibility without invented proof.
- Product interest and contact handoff.
- Responsive/accessibility risks from source inspection.

## Findings from the source review

1. The homepage explained NetHub's capabilities but did not make the target business outcome and audience clear quickly enough.
2. The four service categories were presented on one general page; the home and services cards were not useful entry points into detailed service information.
3. The service pages needed stronger connections between customer problems, deliverables and a relevant enquiry action.
4. The site described its approach in broad terms but did not show a clear discovery-to-delivery path.
5. The contact form uses a visitor-controlled `mailto:` handoff. It must not imply that the website itself submits or stores an enquiry, and visitors need a visible direct-email fallback.
6. Page metadata was broad and missed accurate Kenya-focused service intent.
7. No client testimonials, named case studies, verified performance metrics, certifications or guarantees were present in the reviewed source. None should be invented to fill the trust gap.

## External discovery signal

Search-indexed results for `nethub.co.ke` returned a different enterprise/fintech-heavy brand presentation, including strong performance and certification claims. The search results may be stale; this is recorded as a brand/search consistency warning, not confirmation of current production content. Verify the live deployment and search index separately.

## Work recorded on this branch

- Repositioned the homepage around business outcomes: customer discovery, operational improvement and useful digital products.
- Reworked the homepage visual narrative to show a clear progression from discovery to customer action to operations.
- Added a practical three-stage explanation of how NetHub works: understand, plan, deliver and improve.
- Added a reusable service content catalogue and four focused, statically generated service landing pages:
  - Website design and web development in Kenya.
  - Mobile application development.
  - SEO and conversion improvement in Kenya.
  - Business technology and systems.
- Rebuilt the services index so every service links to its own detailed page and a relevant enquiry path.
- Improved per-page metadata for the Kenya market and derived sitemap service routes from the shared catalogue.
- Clarified the contact button as an email-draft handoff and added a direct email fallback when `NEXT_PUBLIC_CONTACT_EMAIL` is configured.
- Kept Tawala and NetPay marked Coming soon; product enquiries are not represented as general availability.
- Preserved the typography/login polish and selected surface-elevation tokens already merged into `dev`.
- No authentication, OIDC, token, BFF, backend, database or infrastructure changes.
- Extended the frontend CI pull-request target branches to include `master`, so the required lint, TypeScript and production-build checks run for this PR and future master-targeted frontend PRs.

## Verification

- Branch was originally created from `dev` at `19a2f6241df073b51d07de502b8f93fe48059be4`.
- `dev` advanced with PR #209; latest `dev` has now been merged into this branch without rewriting history.
- Static source review only; no browser screenshot audit was performed in this chat.
- Local lint, typecheck and production build have not been run in this environment.
- Frontend CI run `41929276911` completed successfully: dependency installation, lint, TypeScript typecheck and production build all passed.
- Final accessibility/hierarchy refinement triggered a fresh CI run `41929501892`, currently in progress; wait for that run before marking the branch fully verified.
- Responsive visual review and keyboard interaction checks remain pending.

## Next steps

1. Confirm the merge commit contains both the latest `dev` changes and this branch's service discovery work.
2. Run CI and fix any observed lint, type or build failures.
3. Review the generated service routes and metadata in a deployed preview if one is available.
4. Confirm `NEXT_PUBLIC_CONTACT_EMAIL=hello@nethub.co.ke` and `NEXT_PUBLIC_SITE_URL=https://nethub.co.ke` in the deployment environment.
5. Keep PR #213 in draft until CI and preview review are complete.


## Completed — authenticated account profile (PR #216)

### Scope

Replace the original `/me` authentication diagnostics page with a user-facing account profile based on the NetHubKe profile returned by `GET /api/v1/users/me` (and existing first-login sync behavior).

### Implementation

- Show full name, email, username, active/inactive status, business-workspace linkage, member-since date and last-updated date.
- Use a focused account header and hide marketing navigation/footer on `/me` only.
- Keep `/me` protected by the existing Auth.js session and redirect unauthenticated visitors to `/login`.
- Preserve the existing server-side sign-out action.
- Remove token, cookie, JWT claim and backend reachability diagnostics from the user-facing page.
- Do not change OIDC, token forwarding, backend endpoints, database schema or product authorization.
- Handle profile-fetch failures with a safe, non-technical retry state.

### Verification

- Source inspected on `master` after PR #215 merged at `9d061024f7a2809934c9619301c81afad45c4608`.
- TypeScript profile type extended with optional `created_at` and `updated_at` fields from the supplied API response shape.
- CI and rendered desktop/mobile review are pending PR checks; no local build or browser visual test has been run in this environment.


## Current task — dashboard shell and Next.js 16 (issue #217)

### Plan / boundaries

- Move the profile page to `/dashboard/me`; retain `/me` as a compatibility redirect.
- Make `/dashboard` redirect to `/dashboard/me` initially.
- Add a reusable light dashboard shell with persistent desktop sidebar, mobile navigation, shared header and main content region.
- Show only working navigation: **My profile**. Do not add inert placeholders for future features.
- Upgrade Next.js and `eslint-config-next` to the current stable 16.x line; use ESLint CLI because `next lint` is removed in Next.js 16.
- Add `src/proxy.ts` as an optimistic cookie-presence gate for dashboard requests only. Keep `auth()` in the dashboard layout as the authoritative session check.
- Preserve the existing OIDC provider, PKCE/state cookies, server-side token retrieval, NetHubKe profile call/first-login sync and sign-out action.
- Update crawler directives, documentation and trackers. Do not add backend work or new dependencies unless the upgrade proves one necessary.

### Implementation / verification status

- [x] Issue #217 created.
- [x] Topic branch created from master commit `ee768708b65c114413fc1f65aed1c99048af8bc6`.
- [x] Stale tracker baseline corrected before implementation.
- [ ] Dashboard shell and route migration.
- [ ] Next.js 16 and lockfile migration.
- [ ] Proxy setup and authentication boundary verification.
- [ ] Lint, typecheck and production build.
- [ ] PR opened against master; do not merge without explicit user approval.
