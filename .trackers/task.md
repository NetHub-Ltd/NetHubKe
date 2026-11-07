# Task — NetHub Corporate UI/UX & Marketing Strengthening

## Status

- Current workstream: corporate-site UI/UX, positioning, trust, conversion, design system, SEO, and accessibility.
- Status: frontend implementation complete; backend contact endpoint and quality gates pending.
- Implementation issue: #223.
- Topic branch: `feat/corporate-uiux-marketing-audit`
- Base branch: `dev`
- Pull-request target: `dev`
- Implementation proposal: `docs/UIUX-MARKETING-IMPLEMENTATION-PROPOSAL.md`

## Delivered

- Repositioned homepage around audience, business outcomes, tangible services, delivery principles, and conversion.
- Removed Tawala/NetPay homepage section and contact-form options.
- Strengthened centralized service catalogue.
- Improved service-detail, About, and services-index journeys.
- Added Organization, WebSite, Service, AboutPage, and ItemList structured data.
- Replaced client-side `mailto:` contact handoff with BFF-based submission.
- Removed `NEXT_PUBLIC_CONTACT_EMAIL` from the client form.
- Added BFF validation, generic error responses, upstream timeout, and backend forwarding.

## Backend dependency

The frontend expects:

```http
POST /api/v1/contact-enquiries
```

with JSON fields: `name`, `email`, `company`, `service`, and `message`.

The backend owner should implement persistence, spam protection, rate limiting, notification, and any required email delivery.

## Remaining work

- [ ] Implement backend contact-enquiries endpoint.
- [ ] Run `npm ci`, `npm run lint`, TypeScript typecheck, and production build.
- [ ] Review keyboard navigation, focus visibility, contrast, responsive behavior, and form states.
- [ ] Validate structured data in a rendered preview.
- [ ] Review PR #224; do not merge without explicit user approval.

## Boundaries

- No Tawala or NetPay product work.
- No backend endpoint implementation in this frontend workstream.
- No authentication, OIDC, database, or infrastructure changes.
- No invented testimonials, metrics, client names, certifications, or outcomes.
- Do not push directly to `dev` or `master`.
- Do not merge without explicit user approval.
