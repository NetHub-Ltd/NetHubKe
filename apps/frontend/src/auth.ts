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
 * Generic OIDC (Zitadel, etc.). Register at IdP first; NetHub syncs on login.
 * Default post-login path is /dashboard (set by signIn callbackUrl).
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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user, profile }): Promise<JWT | null> {
      if (account && user) {
        const idp = {
          sub:
            (typeof profile?.sub === "string" && profile.sub) ||
            account.providerAccountId ||
            undefined,
          email:
            (typeof profile?.email === "string" && profile.email) ||
            user.email ||
            null,
          name:
            (typeof profile?.name === "string" && profile.name) ||
            user.name ||
            null,
          preferredUsername:
            typeof (profile as { preferred_username?: string } | undefined)
              ?.preferred_username === "string"
              ? (profile as { preferred_username: string }).preferred_username
              : null,
          emailVerified: Boolean(
            (profile as { email_verified?: boolean } | undefined)
              ?.email_verified,
          ),
        };

        try {
          const { backendFetch } = await import("@/lib/server/backend");
          const response = await backendFetch("/users/sync", {
            method: "POST",
            accessToken: account.access_token,
          });

          if (!response.ok) throw new Error("Backend rejected IdP token");

          const backendUser = await response.json();
          const parsed = zUserRead.parse(backendUser);

          if (!parsed.is_active) {
            throw new Error("User account is inactive");
          }

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            idToken: account.id_token,
            expiresAt: (account.expires_at ?? 0) * 1000,
            idp,
            user: {
              id: parsed.id,
              tenantId: parsed.tenant_id ?? "",
              isActive: parsed.is_active,
              email: parsed.email || idp.email,
              name: parsed.full_name || idp.name,
              username: parsed.username || idp.preferredUsername,
            },
            error: undefined,
          };
        } catch (error) {
          console.error("Backend Sync Error:", error);
          return { ...token, idp, error: "SyncError" };
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
            email: token.user.email,
            name: token.user.name,
            username: token.user.username,
          };
        }
        session.accessToken = token.accessToken;
        session.idToken = token.idToken;
        session.error = token.error;
        session.idp = token.idp;
      }
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
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
    if (secret) body.set("client_secret", secret);

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const tokens = await response.json();
    if (!response.ok) throw tokens;

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
