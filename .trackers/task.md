# Task — NetHub Corporate UI/UX & Marketing Strengthening

## Status

- Current workstream: corporate-site UI/UX, positioning, trust, conversion, design system, SEO, and accessibility.
- Status: implementation complete; quality gates and PR creation pending.
- Implementation issue: #223.
- Topic branch: `feat/corporate-uiux-marketing-audit`
- Base branch: `dev`
- Pull-request target: `dev`
- Implementation proposal: `docs/UIUX-MARKETING-IMPLEMENTATION-PROPOSAL.md`

## Delivered

- Repositioned the homepage around audience, business outcomes, tangible services, delivery principles, and conversion.
- Removed the Tawala/NetPay homepage section and contact-form options.
- Strengthened the centralized service catalogue: summaries, deliverables, outcomes, and FAQs.
- Improved service-detail journeys: clearer primary CTA, breadcrumb-first hierarchy, expectations, and Service structured data.
- Improved the About page: audience clarity, engagement expectations, stronger metadata, and AboutPage structured data.
- Improved the services index: decision guide, ItemList structured data, and a clearer conversion path.
- Improved contact-form reassurance, validation, accessible error association, and direct-email fallback.
- Added Organization and WebSite structured data to the homepage.

## Remaining verification

- Run `npm ci`, `npm run lint`, TypeScript typecheck, and production build.
- Review keyboard navigation, focus visibility, contrast, responsive behavior, and form states.
- Open one PR targeting `dev`.

## Boundaries

- No Tawala or NetPay product work.
- No backend, authentication, OIDC, database, or infrastructure changes.
- No invented testimonials, metrics, client names, certifications, or outcomes.
- Do not push directly to `dev` or `master`.
- Do not merge without explicit user approval.
