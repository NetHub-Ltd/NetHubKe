"use client";

import { useSession } from "next-auth/react";
import { keycloakLogin } from "@/lib/utils/authClient";
import { federatedLogout } from "@/lib/actions/logout";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button disabled>...</button>;

  return status === "authenticated" ? (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        const url = await federatedLogout();
        if (url) window.location.href = url;
      }}
    >
      Sign Out ({session?.user?.email})
    </button>
  ) : (
    <button
      type="button"
      className="bg-brand-primary"
      onClick={() => keycloakLogin("/dashboard")}
    >
      Login
    </button>
  );
}
