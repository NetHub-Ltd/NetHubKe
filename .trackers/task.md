# Task — NetHub Corporate Site Discovery & Conversion

## Status

**Draft PR opened** — [PR #213](https://github.com/NetHub-Ltd/NetHubKe/pull/213) on `feat/site-discovery-conversion-review`, created directly from `dev` at `19a2f6241df073b51d07de502b8f93fe48059be4`.

- Related issue: #212 — Improve corporate site positioning, conversion and search discovery.
- This branch intentionally does not include the separate, unmerged typography/login work in PR #211.
- Delivery target: one reviewable PR to `dev`; do not merge without user approval.\n- Frontend CI run: `41928768865` — currently in progress at dependency installation.

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
- Improved per-page metadata for the Kenya market and added service detail routes to the sitemap.
- Clarified the contact button as an email-draft handoff and added a direct email fallback when `NEXT_PUBLIC_CONTACT_EMAIL` is configured.
- Kept Tawala and NetPay marked Coming soon; product enquiries are not represented as general availability.
- No authentication, OIDC, token, BFF, backend, database or infrastructure changes.

## Verification

- Branch created from the exact `dev` SHA above.
- Static review only; no browser screenshot audit was performed in this chat.
- Local lint, typecheck and production build have not been run in this environment.
- GitHub Actions must be checked after the branch changes settle. Do not report gates as passed before observing their results.
- Responsive visual review and keyboard interaction checks remain pending.

## Next steps

1. Inspect the complete branch diff and confirm only intended public-site/content/tracker files changed.
2. Run CI and fix any observed lint, type or build failures.
3. Review the generated service routes and metadata in a deployed preview if one is available.
4. Confirm `NEXT_PUBLIC_CONTACT_EMAIL=hello@nethub.co.ke` and `NEXT_PUBLIC_SITE_URL=https://nethub.co.ke` in the deployment environment.
5. Update this tracker with observed verification; keep PR #213 in draft until CI and preview review are complete.
