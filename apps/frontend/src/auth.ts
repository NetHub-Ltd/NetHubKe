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
 * OIDC login must succeed even when FastAPI is unreachable.
 * Backend /users/sync enriches the session when available; it must not
 * wipe the cookie on failure (that blocked /dashboard after Zitadel auth).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
    async jwt({ token, account, user, profile }): Promise<JWT> {
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

        const idpUser = {
          id: idp.sub || account.providerAccountId || "unknown",
          tenantId: "",
          isActive: true,
          email: idp.email,
          name: idp.name,
          username: idp.preferredUsername,
        };

        const base: JWT = {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: (account.expires_at ?? 0) * 1000,
          idp,
          user: idpUser,
          backendSynced: false,
          error: undefined,
        };

        try {
          const { backendFetch } = await import("@/lib/server/backend");
          const response = await backendFetch("/users/sync", {
            method: "POST",
            accessToken: account.access_token,
          });

          if (!response.ok) {
            console.warn(
              "Backend sync skipped:",
              response.status,
              "(session kept from IdP)",
            );
            return base;
          }

          const backendUser = await response.json();
          const parsed = zUserRead.safeParse(backendUser);
          if (!parsed.success || !parsed.data.is_active) {
            console.warn("Backend user invalid or inactive; using IdP profile");
            return base;
          }

          const u = parsed.data;
          return {
            ...base,
            backendSynced: true,
            user: {
              id: u.id,
              tenantId: u.tenant_id ?? "",
              isActive: u.is_active,
              email: u.email || idp.email,
              name: u.full_name || idp.name,
              username: u.username || idp.preferredUsername,
              phoneNumber: u.phone_number ?? null,
              tenantName: u.tenant_name ?? null,
              tenantTier: u.tenant_tier ?? null,
              createdAt: u.created_at ?? null,
            },
          };
        } catch (error) {
          console.warn("Backend sync unavailable; IdP session only:", error);
          return base;
        }
      }

      if (token.error === "RefreshAccessTokenError") {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      const now = Date.now();
      const buffer = 60 * 1000;
      if (
        token.expiresAt &&
        now > token.expiresAt - buffer &&
        token.refreshToken
      ) {
        return await refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        session.error = token.error;
        return session;
      }

      if (token.user) {
        session.user = {
          ...session.user,
          id: token.user.id,
          tenantId: token.user.tenantId,
          isActive: token.user.isActive,
          email: token.user.email ?? session.user?.email ?? null,
          name: token.user.name ?? session.user?.name ?? null,
          username: token.user.username ?? null,
          phoneNumber: token.user.phoneNumber ?? null,
          tenantName: token.user.tenantName ?? null,
          tenantTier: token.user.tenantTier ?? null,
          createdAt: token.user.createdAt ?? null,
        };
      }
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      session.idp = token.idp;
      session.backendSynced = Boolean(token.backendSynced);
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
    console.error("RefreshAccessTokenError:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
