import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Build the browser-visible session DTO from the encrypted Auth.js token.
 * Deliberately copies identity/profile fields only; bearer tokens stay private.
 */
export function toPublicSession(session: Session, token: JWT): Session {
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

  session.error = token.error;
  session.backendSynced = Boolean(token.backendSynced);
  return session;
}
