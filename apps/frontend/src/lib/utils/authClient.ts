// lib/auth-client.ts
"use client";

import { signIn } from "next-auth/react";

export const keycloakLogin = async () => {
  const callbackUrl =
    window.location.pathname === "/login" ? "/dashboard" : window.location.href;

  await signIn("keycloak", { callbackUrl });
};
