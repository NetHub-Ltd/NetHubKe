"use client";
import { keycloakLogin } from "@/lib/utils/authClient";
import { useSession } from "next-auth/react";
import { federatedLogout } from "../actions/logout";

export function LoginButton() {
  return (
    <button
      className="bg-brand-primary px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-all"
      onClick={() => keycloakLogin()}
    >
      Login
    </button>
  );
}

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      const url = await federatedLogout();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
      onClick={handleLogout}
    >
      Sign Out
    </button>
  );
}
