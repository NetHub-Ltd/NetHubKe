import { NextResponse, type NextRequest } from "next/server";

const sessionCookieNames = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

/**
 * Perform only an optimistic cookie-presence check before entering the dashboard.
 *
 * This is not authentication: cookies can be expired or invalid. The dashboard
 * layout must still validate the session through Auth.js before rendering data.
 * Check chunk suffixes because Auth.js may split large session cookies.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.getAll().some(({ name }) =>
    sessionCookieNames.some(
      (cookieName) => name === cookieName || name.startsWith(`${cookieName}.`),
    ),
  );

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
