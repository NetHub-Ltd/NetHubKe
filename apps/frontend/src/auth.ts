import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import { zUserRead } from "./lib/types/api/zod.gen";
import {
  oidcClientId,
  oidcClientSecret,
  oidcDiscovery,
  oidcIssuer,
} from "./lib/server/oidcConfig";

/**
 * Generic OIDC provider (Keycloak, Zitadel, Authentik, …).
 * Register users at the IdP first; NetHub syncs on first login via /users/sync.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "oidc",
      name: "OIDC",
      type: "oidc",
      issuer: oidcIssuer(),
      clientId: oidcClientId(),
      clientSecret: oidcClientSecret() || undefined,
      authorization: { params: { scope: "openid profile email" } },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }): Promise<JWT | null> {
      // 1. INITIAL SIGN-IN
      if (account && user) {
        try {
          const { backendFetch } = await import("@/lib/server/backend");
          const response = await backendFetch("/users/sync", {
            method: "POST",
            accessToken: account.access_token,
          });

          if (!response.ok) throw new Error("Backend rejected IdP token");

          const backendUser = await response.json();
          const parsed_data = zUserRead.parse(backendUser);

          if (!parsed_data.is_active) {
            throw new Error("User account is inactive");
          }
          const next: JWT = {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            idToken: account.id_token,
            expiresAt: (account.expires_at ?? 0) * 1000,
            user: {
              id: parsed_data.id,
              tenantId: parsed_data.tenant_id ?? "",
              isActive: parsed_data.is_active,
            },
            error: undefined,
          };
          return next;
        } catch (error) {
          console.error("Backend Sync Error:", error);
          return { ...token, error: "SyncError" };
        }
      }

      if (
        token.error === "RefreshAccessTokenError" ||
        token.error === "SyncError"
      ) {
        console.warn("JWT: Cleaning up stale session cookie.");
        return null;
      }

      const now = Date.now();
      const buffer = 60 * 1000;
      if (token.expiresAt && now > token.expiresAt - buffer) {
        return await refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        if (token.user) {
          session.user = {
            ...session.user,
            id: token.user.id,
            tenantId: token.user.tenantId,
            isActive: token.user.isActive,
          };
        }
        session.accessToken = token.accessToken;
        session.idToken = token.idToken;
        session.error = token.error;
      }
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("Attempting token refresh...");
  try {
    const discovery = await oidcDiscovery();
    const tokenEndpoint =
      discovery.token_endpoint || `${oidcIssuer()}/oauth/v2/token`;

    const body = new URLSearchParams({
      client_id: oidcClientId(),
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });
    const secret = oidcClientSecret();
    if (secret) {
      body.set("client_secret", secret);
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const tokens = await response.json();
    if (!response.ok) throw tokens;

    console.log("Token refreshed successfully.");

    return {
      ...token,
      accessToken: tokens.access_token,
      idToken: tokens.id_token ?? token.idToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Refresh Error Logic Triggered:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
