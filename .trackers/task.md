# Task — NetHub Website Visual and Login Polish

## Status

**In progress** — implementation is on `feat/site-visual-login-polish`, based on the latest `dev`.

## Parent delivery

The corporate website experience was merged in PR #206. This follow-up is limited to the requested visual polish and dedicated login presentation.

## Approved direction

- Keep the existing blue/cyan gradient as the global site canvas, including the login screen.
- Poppins for headings; DM Sans for body and interface text.
- Deep navy/warm ink rather than pure black.
- Subtle elevation on selected light content surfaces; avoid a card-heavy redesign.
- Centered login panel with the heading “Log in with NetHub”.
- Hide the public site header/footer on the login route so the form is the visual focus.

## Feature issue

- #210 — typography, global gradient canvas, subtle surface elevation and NetHub login page.

## Implementation recorded

- Switched the Next.js font pair to Poppins + DM Sans.
- Promoted the blue/cyan radial gradient into the global page canvas.
- Adjusted semantic ink tokens to a deep navy tone.
- Added a restrained reusable shadow token and applied it to light content cards.
- Added `SiteChrome` to keep navigation/footer on other routes while allowing the login route to use the full canvas.
- Replaced the generic OIDC login copy with a centered “Log in with NetHub” experience.
- Preserved the existing server action call: `signIn("oidc", { redirectTo: "/me" })`.
- No changes to `auth.ts`, provider configuration, PKCE/state cookies, token handling, BFF routes or backend auth.

## Verification

- GitHub source files were inspected on `dev` before changes.
- Changed files were fetched again from the topic branch after writes.
- Lint, TypeScript, production build and rendered visual checks are still pending.
- Do not merge without explicit user approval.

## Next steps

1. Review branch diff and verify no authentication implementation was changed.
2. Run frontend lint, typecheck and production build through CI.
3. Review the public site and login at mobile, tablet and desktop widths.
4. Update this tracker with observed verification results.
5. Open one PR targeting `dev` and leave it unmerged for user review.
