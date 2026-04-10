// lib/auth-client.ts
"use client";

import { signIn } from "next-auth/react";

export const login = async () => {
  const callbackUrl =
    window.location.pathname === "/login" ? "/welcome" : window.location.href;

  await signIn("keycloak", { callbackUrl });
};
