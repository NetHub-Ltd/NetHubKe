import { DefaultSession } from "next-auth";

/** Claims from the IdP (Zitadel/OIDC) plus app user after /users/sync */
export type IdpProfile = {
  sub?: string;
  email?: string | null;
  name?: string | null;
  preferredUsername?: string | null;
  emailVerified?: boolean;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      isActive: boolean;
      email?: string | null;
      name?: string | null;
      username?: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
    idToken?: string;
    error?: string;
    /** Raw-ish IdP identity captured at sign-in */
    idp?: IdpProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    user?: {
      id: string;
      tenantId: string;
      isActive: boolean;
      email?: string | null;
      name?: string | null;
      username?: string | null;
    };
    idp?: IdpProfile;
    error?: string;
  }
}
