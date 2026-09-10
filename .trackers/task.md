# Current focus: User flow BFF + nav (implementing)

## Done in feat/user-flow-bff-nav
- BFF GET/PATCH /api/nethub/users/me
- useUser → same-origin BFF (no NEXT_PUBLIC backend)
- backendFetch server helper + auth sync via helper
- Navbar: Log in / Create account | Dashboard + Sign out
- Login page register CTA; /welcome → /dashboard
- /api/auth/register → Keycloak registrations

## Next after merge
- Smoke login → dashboard profile
- Confirm BACKEND_URL includes host (helper adds /api/v1)
- Realm user registration enabled in Keycloak
