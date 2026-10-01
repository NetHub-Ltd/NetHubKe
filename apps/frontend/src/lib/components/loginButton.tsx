"use client";

import { oidcLogin } from "@/lib/utils/authClient";

export function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => oidcLogin("/dashboard")}
      className="btn-primary w-full py-space-md"
    >
      Continue with NetHub ID
    </button>
  );
}
