
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  console.log(
    `[Middleware] Path: ${nextUrl.pathname} | Authenticated: ${!!session}`,
  );

  // 1. Identify Protected Routes
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/settings");

  // 2. Core Logic: Is the session missing or flagged with an error?
  // (Your JWT callback returns null or a token with an .error property)
  const isSessionInvalid = !session || !!session.error;

  // 3. Enforcement
  if (isProtectedRoute && isSessionInvalid) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Matches all paths except static files, internal Next.js paths, and your auth APIs
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
