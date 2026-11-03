import { NextResponse } from "next/server";

/**
 * Route registration through Auth.js so it generates state, nonce, PKCE and
 * the complete authorization request from the configured OIDC provider.
 */
export async function GET(request: Request) {
  const signInUrl = new URL("/api/auth/signin/oidc", request.url);
  signInUrl.searchParams.set("callbackUrl", "/dashboard");
  return NextResponse.redirect(signInUrl, 303);
}
