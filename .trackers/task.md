# Task — NetHub Corporate Website

## Status

**Completed and merged** — corporate website redesign delivered in PR #206.

**In progress** — follow-up polish is tracked in issue #208 on `polish/corporate-typography-login`, based on `dev`.

## Approved direction

Growth Partner + Hybrid:
- Light-first warm neutral pages.
- Deep navy/dark feature sections selectively.
- Confident blue primary accent and restrained cyan.
- NetHub is positioned as a business growth partner powered by technology.
- Public messaging focuses on business problems and outcomes, not identity-provider internals.

## Feature issues

- [ ] #201 — visual system and shared shell.
- [ ] #202 — home, services and about.
- [ ] #203 — products.
- [ ] #204 — contact enquiry journey.
- [ ] #205 — SEO and quality.

All feature sets are intended for one PR to `dev`.

## Work recorded

- Replaced the dark-first theme tokens with light-first semantic tokens and retained dark feature surfaces.
- Updated shared navigation and footer.
- Repositioned home, services and about content.
- Added a products page with Tawala and NetPay marked Coming soon.
- Reworked contact form to remove its simulated success state; current approach is a visitor-controlled mailto handoff.
- Added metadata, canonical paths, Organization JSON-LD, sitemap and robots routes.
- Added public site/contact environment variables and documentation.
- Auth.js/OIDC, token handling, BFF and NetHubKe integration have not been intentionally changed.

## Open decisions / blockers

- **Contact inbox:** confirmed as `hello@nethub.co.ke` and configured in `apps/frontend/.env.example`. The deployment environment must use the same value. The current form opens a visitor-controlled email draft; it does not submit to a server or store enquiries.
- Confirm the production canonical origin if it differs from `https://nethub.co.ke`.

## Verification

- Repository file writes are recorded on the topic branch.
- Local build, lint and typecheck have **not** been run in this environment because the container cannot resolve `github.com` for cloning.
- GitHub Actions frontend CI must be checked after PR creation. Do not report any gate as passed before its result is observed.

## Next steps

1. Set `NEXT_PUBLIC_CONTACT_EMAIL=hello@nethub.co.ke` in the frontend deployment environment.
2. Review changed files and the branch diff.
3. Run or obtain CI: lint, TypeScript and Next build.
4. Update trackers with actual final verification.
5. Open one PR to `dev`, referencing issues #201–#205.


## Follow-up polish — issue #208

- Replace heading font with Poppins and body/UI font with DM Sans.
- Use deep navy semantic text instead of near-black.
- Add restrained elevation to selected content panels only.
- Make /login a standalone centered NetHub sign-in screen with a blue/cyan gradient backdrop.
- Hide marketing header/footer only on /login.
- Preserve the existing Auth.js OIDC server action, PKCE/state behavior and redirect to /me.
- Verify lint, TypeScript and production build before PR review.
