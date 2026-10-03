"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { zUserRead } from "../types/api/zod.gen";
import type { UserRead } from "../types/api/types.gen";

/**
 * Profile is authoritative from NetHub API via BFF.
 * Session proves login; /api/nethub/users/me supplies the user after Zod validation.
 */
export function useUser() {
  const { data: session, status: sessionStatus } = useSession();

  const isPoisoned = session?.error === "RefreshAccessTokenError";
  const isUnauthenticated = sessionStatus === "unauthenticated";
  const isLoadingSession = sessionStatus === "loading";
  const isAuthenticated = sessionStatus === "authenticated" && !isPoisoned;

  const {
    data: backendUser,
    isLoading: isLoadingUser,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["nethub-user", session?.user?.id],
    queryFn: async (): Promise<UserRead> => {
      const response = await fetch("/api/nethub/users/me");
      if (response.status === 401) throw new Error("Unauthorized");
      if (response.status === 403) throw new Error("Account disabled");
      if (response.status === 502 || response.status >= 500) {
        throw new Error("Backend unavailable");
      }
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userdata = await response.json();
      const parsed = zUserRead.safeParse(userdata);
      if (!parsed.success) {
        console.error("Zod Validation Errors:", parsed.error.format());
        throw new Error("Invalid user data format");
      }
      if (!parsed.data.is_active) {
        throw new Error("Account disabled");
      }
      return parsed.data;
    },
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isPoisoned) {
      toast.error("Session expired", {
        description: "Please sign in again.",
      });
    }
  }, [isPoisoned]);

  useEffect(() => {
    if (fetchError?.message === "Account disabled") {
      toast.error("Account disabled", {
        description: "Contact NetHub support if this is unexpected.",
      });
    }
  }, [fetchError]);

  // Authoritative user = backend only (BFF already Zod-stripped)
  const user = backendUser ?? null;

  const authStatus = (() => {
    if (isLoadingSession) return "loading";
    if (isPoisoned) return "stale";
    if (isUnauthenticated) return "unauthenticated";
    if (isAuthenticated && isLoadingUser) return "loading";
    if (isAuthenticated && user) return "authenticated";
    if (isAuthenticated && fetchError) return "error";
    if (isAuthenticated) return "loading";
    return "idle";
  })();

  return {
    user,
    status: authStatus,
    error: isPoisoned
      ? "Session Expired"
      : fetchError
        ? fetchError
        : null,
    accessToken: session?.accessToken,
    backendSynced: Boolean(user),
    refresh: refetch,
  };
}
