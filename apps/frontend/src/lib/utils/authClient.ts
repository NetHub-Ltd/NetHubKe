"use client";

import { signIn } from "next-auth/react";

/** Start OIDC login (IdP-agnostic; provider id "oidc"). */
export const oidcLogin = async (callbackUrl = "/dashboard") => {
  await signIn("oidc", { callbackUrl });
};

/** @deprecated Use oidcLogin */
export const keycloakLogin = oidcLogin;

/**
 * Signup is owned by the IdP (register in Zitadel first, then NetHub syncs).
 * Hits BFF which redirects to IdP authorization endpoint.
 */
export const oidcRegister = () => {
  window.location.href = "/api/nethub/register";
};

/** @deprecated Use oidcRegister */
export const keycloakRegister = oidcRegister;
