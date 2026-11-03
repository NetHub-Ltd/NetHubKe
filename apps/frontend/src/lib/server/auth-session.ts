import "server-only";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
export { isSameOriginMutation } from "./auth-session-policy";

type CanonicalUser = {
  id?: string;
  isActive?: boolean;
};

export type ServerAuthToken = JWT & {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  backendSynced?: boolean;
  user?: CanonicalUser;
};

/**
 * Read the encrypted Auth.js JWT directly from the request cookie.
 *
 * This is deliberately server-only: the public session callback must never
 * serialize upstream access, refresh, ID, or product tokens to browser code.
 */
export async function readServerAuthToken(
  request?: Request,
): Promise<ServerAuthToken | null> {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[BFF] AUTH_SECRET is not configured");
    return null;
  }

  try {
    const requestHeaders = request?.headers ?? (await headers());
    const token = await getToken({
      req: { headers: requestHeaders } as NextRequest,
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });
    return (token as ServerAuthToken | null) ?? null;
  } catch (error) {
    console.warn("[BFF] Could not decode the Auth.js session cookie:", error);
    return null;
  }
}

/** Require a live upstream credential and an initialized active NetHub identity. */
export async function readProvisionedServerAuth(
  request?: Request,
): Promise<{ accessToken: string; userId: string } | null> {
  const token = await readServerAuthToken(request);
  const user = token?.user;
  if (
    !token ||
    !user ||
    token.error === "RefreshAccessTokenError" ||
    token.backendSynced !== true ||
    user.isActive !== true ||
    typeof user.id !== "string" ||
    typeof token.accessToken !== "string" ||
    !token.accessToken
  ) {
    return null;
  }

  return { accessToken: token.accessToken, userId: user.id };
}
