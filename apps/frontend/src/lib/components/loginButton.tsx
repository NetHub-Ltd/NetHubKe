"use client";

import { useSession } from "next-auth/react";
import { login } from "@/lib/utils/authClient";

export function LoginButton() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <button className="px-4 py-2 opacity-50" disabled>
        Loading...
      </button>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <button className="bg-brand-primary px-4 py-2 text-white" onClick={login}>
      Login
    </button>
  );
}
