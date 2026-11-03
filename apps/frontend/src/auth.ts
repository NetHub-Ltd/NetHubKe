import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { NextAuthConfig } from "next-auth";

/**
 * IdP-agnostic OIDC via Auth.js.
 *
 * PKCE: the code_verifier is stored in an encrypted cookie between /authorize
 * and /callback. InvalidCheck "pkceCodeVerifier value could not be parsed"
 * usually means that cookie was missing, not decryptable (AUTH_SECRET mismatch),
 * or set with wrong Secure/SameSite for the public URL.
 */

const authUrl = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
const useSecureCookies =
  process.env.AUTH_USE_SECURE_COOKIES === "true" ||
  authUrl.startsWith("https://") ||
  process.env.VERCEL === "1";

const cookiePrefix = useSecureCookies ? "__Secure-" : "";

function authCookie(
  name: string,
  maxAge?: number
): { name: string; options: Record<string, unknown> } {
  return {
    name: `${cookiePrefix}${name}`,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: useSecureCookies,
      // Host-only cookie (no domain) so callback on nethub.co.ke matches set host
      ...(maxAge != null ? { maxAge } : {}),
    },
  };
}

const config = {
  providers: [
    {
      id: "oidc",
      name: "OIDC",
      type: "oidc" as const,
      issuer: process.env.AUTH_OIDC_ISSUER,
      clientId: process.env.AUTH_OIDC_CLIENT_ID,
      clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET,
      wellKnown:
        process.env.AUTH_OIDC_WELL_KNOWN ||
        (process.env.AUTH_OIDC_ISSUER
          ? `${process.env.AUTH_OIDC_ISSUER.replace(/\/$/, "")}/.well-known/openid-configuration`
          : undefined),
      checks: ["pkce", "state"],
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    },
  ],
  session: { strategy: "jwt" as const },
  // Explicit cookies so PKCE verifier survives the IdP redirect round-trip
  cookies: {
    sessionToken: authCookie("authjs.session-token", 60 * 60 * 24 * 30),
    callbackUrl: authCookie("authjs.callback-url", 60 * 15),
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: authCookie("authjs.pkce.code_verifier", 60 * 15),
    state: authCookie("authjs.state", 60 * 15),
    nonce: authCookie("authjs.nonce", 60 * 15),
  },
  useSecureCookies,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.tokenType = account.token_type;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      session.error = token.error as string | undefined;
      session.hasAccessToken = Boolean(token.accessToken);
      session.hasIdToken = Boolean(token.idToken);
      session.expiresAt = token.expiresAt as number | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

declare module "next-auth" {
  interface Session {
    error?: string;
    hasAccessToken?: boolean;
    hasIdToken?: boolean;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    error?: string;
  }
}
