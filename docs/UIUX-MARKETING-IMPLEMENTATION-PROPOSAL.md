# NetHubKe Corporate UI/UX & Marketing Implementation Proposal

## Status

- **Status:** Implementation complete; backend contact endpoint and quality gates pending.
- **Topic branch:** `feat/corporate-uiux-marketing-audit`
- **Base branch:** `dev`
- **Pull-request target:** `dev`
- **Implementation issue:** #223
- **Scope:** NetHubKe corporate website UI/UX, positioning, content, trust, conversion, design system, SEO/discoverability, and accessibility.
- **Explicitly out of scope:** Tawala and NetPay product development, backend endpoint implementation, authentication, OIDC, database changes, infrastructure, and new product claims.

## Contact architecture

The public contact form must not expose a destination email address to the browser. It submits JSON to the BFF, which validates the request and forwards it to the NetHubKe backend.

### Client contract

```http
POST /api/bff/contact
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "company": "string | null",
  "service": "string | null",
  "message": "string"
}
```

### Backend contract

```http
POST /api/v1/contact-enquiries
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "company": "string | null",
  "service": "string | null",
  "message": "string"
}
```

Expected backend responses:

- `200` or `201`: enquiry accepted.
- `400`: validation error.
- `429`: rate limited.
- `5xx`: backend failure.

The BFF returns only a minimal response to the browser and does not expose backend errors, stack traces, internal service details, or the destination email address.

## Security boundary

- No `NEXT_PUBLIC_CONTACT_EMAIL` is used by the contact form.
- The destination email address, if used, remains server-side or backend-side.
- The BFF uses the server-only `NETHUB_API_URL` environment variable.
- The BFF validates field presence, email format, and maximum field lengths.
- The BFF applies a 10-second upstream timeout and returns generic failure messages.
- Rate limiting, spam protection, and persistence are backend responsibilities.

## Implementation phases

1. Positioning and homepage narrative — complete.
2. Service content architecture — complete.
3. Trust and credibility — complete.
4. Conversion journey — complete, pending backend endpoint.
5. Design-system refinement — core shared patterns improved; broader component extraction intentionally deferred.
6. SEO and discoverability — complete for current public pages.
7. Accessibility and quality gates — pending verification.

## Verification plan

- Run `npm ci`, `npm run lint`, TypeScript typecheck, and production build.
- Review keyboard navigation, focus visibility, contrast, responsive behavior, and form states.
- Validate structured data in a rendered preview.
- Confirm the BFF does not expose destination email addresses or backend error details.
- Do not claim browser visual review or production deployment unless actually verified.

## Rollback

- Revert the PR commits or close/revert the PR.
- No irreversible data, backend, authentication, database, or infrastructure changes are included.

## Handoff instructions

Another agent should:

1. Read this document and `AGENTS.md`.
2. Pull the latest `feat/corporate-uiux-marketing-audit` branch.
3. Implement or confirm the backend `POST /api/v1/contact-enquiries` contract.
4. Run applicable quality gates.
5. Review PR #224 and do not merge without explicit user approval.
