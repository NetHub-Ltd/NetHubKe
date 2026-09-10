import { NextResponse } from "next/server";

/**
 * Redirect to Keycloak registration (issuer stays server-side).
 */
export async function GET(request: Request) {
  const issuer = process.env.KEYCLOAK_ISSUER?.replace(/\/$/, "");
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const appUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  if (!issuer || !clientId) {
    return NextResponse.json(
      { detail: "Registration is not configured" },
      { status: 503 },
    );
  }

  const url = new URL(`${issuer}/protocol/openid-connect/registrations`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("redirect_uri", `${appUrl}/api/auth/callback/keycloak`);

  return NextResponse.redirect(url.toString());
}
