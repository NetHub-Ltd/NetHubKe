import { DefaultSession } from "next-auth";

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
      phoneNumber?: string | null;
      tenantName?: string | null;
      tenantTier?: string | null;
      createdAt?: string | null;
    } & Omit<DefaultSession["user"], "email" | "name">;
    accessToken?: string;
    idToken?: string;
    error?: string;
    idp?: IdpProfile;
    /** True when FastAPI /users/sync succeeded */
    backendSynced?: boolean;
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
      phoneNumber?: string | null;
      tenantName?: string | null;
      tenantTier?: string | null;
      createdAt?: string | null;
    };
    idp?: IdpProfile;
    backendSynced?: boolean;
    error?: string;
  }
}
