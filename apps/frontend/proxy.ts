import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
    const session = req.auth;
    
    console.log("Middleware Session Check:", {
      sessionExists: !!session,
      expiresAt: session?.expires,
      currentTime: Date.now(),
    });

  // 1. Define your protected paths
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/settings");

  // 2. Case: Accessing protected route without a session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/api/auth/signin", nextUrl.origin));
  }

  // 3. Case: Session exists but tokens have hit the 'expiresAt' limit
  // We check the 'expiresAt' we manually added to the JWT in the previous step
  const expiresAt = session?.expires as number | undefined;

  if (isProtectedRoute && expiresAt && Date.now() > expiresAt) {
    // Session is dead; force a re-login to Keycloak
    const loginUrl = new URL("/api/auth/signin", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href); // Return here after login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Pattern to exclude internal Next.js paths and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
