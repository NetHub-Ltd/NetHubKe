import { auth } from "@/auth";
import { getBackendBaseUrl, probeBackend } from "@/lib/backend";
import {
  decodeJwtPayload,
  getAuthJwt,
  getIdpAccessToken,
  getIdpIdToken,
  listAuthCookieNames,
  sessionCookieName,
} from "@/lib/session-token";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const jwt = await getAuthJwt();
  const accessToken = await getIdpAccessToken();
  const idToken = await getIdpIdToken();
  const cookieNames = await listAuthCookieNames();

  const health = await probeBackend("/health").catch((e) => ({
    ok: false,
    error: String(e),
    url: `${getBackendBaseUrl()}/health`,
    ms: 0,
  }));
  const ready = await probeBackend("/ready").catch((e) => ({
    ok: false,
    error: String(e),
    url: `${getBackendBaseUrl()}/ready`,
    ms: 0,
  }));
  const diagnostics = await probeBackend("/diagnostics").catch((e) => ({
    ok: false,
    error: String(e),
    url: `${getBackendBaseUrl()}/diagnostics`,
    ms: 0,
  }));

  return NextResponse.json({
    session: {
      authenticated: Boolean(session),
      email: session?.user?.email ?? null,
      hasAccessTokenFlag: session?.hasAccessToken ?? false,
      hasIdTokenFlag: session?.hasIdToken ?? false,
      expiresAt: session?.expiresAt ?? null,
    },
    tokens: {
      accessTokenPresent: Boolean(accessToken),
      idTokenPresent: Boolean(idToken),
      accessToken: accessToken ?? null,
      idToken: idToken ?? null,
      accessClaims: accessToken ? decodeJwtPayload(accessToken) : null,
      idClaims: idToken ? decodeJwtPayload(idToken) : null,
      jwtKeys: jwt ? Object.keys(jwt) : [],
    },
    cookies: {
      expectedSessionCookie: sessionCookieName(),
      authRelated: cookieNames,
    },
    config: {
      authUrl: process.env.AUTH_URL || process.env.NEXTAUTH_URL || null,
      oidcIssuer: process.env.AUTH_OIDC_ISSUER || null,
      nethubApiUrl: getBackendBaseUrl() || null,
    },
    backend: {
      health,
      ready,
      diagnostics,
    },
  });
}
