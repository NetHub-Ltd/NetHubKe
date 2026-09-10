"use client";

import { signIn } from "next-auth/react";

/** Start Keycloak login; land on dashboard by default. */
export const keycloakLogin = async (callbackUrl = "/dashboard") => {
  await signIn("keycloak", { callbackUrl });
};

/**
 * Keycloak registration entry (hosted UI).
 * Uses relative BFF so KEYCLOAK_ISSUER is not required in the browser.
 */
export const keycloakRegister = () => {
  window.location.href = "/api/nethub/register";
};
