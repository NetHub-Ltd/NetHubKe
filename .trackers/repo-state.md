# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Integration branch: `dev`
- `dev` created from `master` at commit `01969ef693b1acc2c25d07e12b19d03d93e7b0bb`.
- Current topic branch: `feat/corporate-uiux-marketing-audit`, created from `dev`.
- Current implementation issue: #223.
- Current proposal: `docs/UIUX-MARKETING-IMPLEMENTATION-PROPOSAL.md`.
- PR target: `dev`.

## Implementation status

- Phase 1: complete.
- Phase 2: complete.
- Phase 3: complete.
- Phase 4: complete.
- Phase 5: core shared patterns improved; broader component extraction intentionally deferred.
- Phase 6: homepage, service, About, and services-index structured data and metadata improved.
- Phase 7: quality gates and accessibility/responsive verification pending.

## Application baseline

- Frontend: Next.js 16.4.5, React 19.3.1, TypeScript, Tailwind CSS 3.
- Linting: ESLint 10.14.0 with `eslint-config-next` 16.4.5 native flat config; `npm run lint` executes `eslint .`.
- Minimum Node.js version is 20.19.0; frontend CI runs Node.js 22 with `npm ci`, lint, TypeScript typecheck and production build.

## Scope boundaries

- Corporate website UI/UX and marketing only.
- No Tawala or NetPay product development.
- No backend, authentication, OIDC, database, or infrastructure changes.
- No invented testimonials, metrics, client names, certifications, or outcome claims.
- PRs must target `dev`; do not push directly to `dev` or `master`.
