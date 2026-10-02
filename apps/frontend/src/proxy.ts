import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Network boundary (Next.js 16 proxy). Soft-guard /dashboard.
 * Session must not depend on backend; only missing/expired OIDC blocks access.
 */
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isProtected = nextUrl.pathname.startsWith("/dashboard");
  const hasSession = Boolean(session?.user?.id);
  const isExpired = session?.error === "RefreshAccessTokenError";

  if (isProtected && (!hasSession || isExpired)) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    nextUrl.pathname === "/login" &&
    hasSession &&
    !isExpired
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// Default export for compatibility with auth() wrapper consumers
export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};
