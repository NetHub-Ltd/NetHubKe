import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  const isSessionInvalid = !session || !!session.error;

  if (isProtectedRoute && isSessionInvalid) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users hitting /login → dashboard
  if (nextUrl.pathname === "/login" && session && !session.error) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
