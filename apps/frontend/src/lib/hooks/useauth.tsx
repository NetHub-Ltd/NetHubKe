"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { zUserRead } from "../types/api/zod.gen";
import type { UserRead } from "../types/api/types.gen";

/**
 * Session-first profile. Backend /users/me is optional enrichment.
 * Dashboard must work after Zitadel login even when FastAPI is down.
 */
export function useUser() {
  const { data: session, status: sessionStatus } = useSession();

  const isPoisoned = session?.error === "RefreshAccessTokenError";
  const isUnauthenticated = sessionStatus === "unauthenticated";
  const isLoadingSession = sessionStatus === "loading";
  const isAuthenticated = sessionStatus === "authenticated" && !isPoisoned;

  const sessionProfile: UserRead | null = useMemo(() => {
    if (!isAuthenticated || !session?.user?.id) return null;
    const u = session.user;
    const idp = session.idp;
    return {
      id: u.id,
      email: u.email || idp?.email || "",
      full_name: u.name || idp?.name || "",
      username: u.username || idp?.preferredUsername || "",
      phone_number: u.phoneNumber ?? null,
      is_active: u.isActive ?? true,
      tenant_id: u.tenantId || null,
      tenant_name: u.tenantName ?? null,
      tenant_tier: u.tenantTier ?? null,
      created_at: u.createdAt ?? null,
    };
  }, [isAuthenticated, session]);

  const {
    data: backendUser,
    isLoading: isLoadingUser,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: [`user-${session?.user?.id}`],
    queryFn: async () => {
      const response = await fetch("/api/nethub/users/me");
      if (response.status === 401) throw new Error("Unauthorized");
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
      return parsed.data;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isPoisoned) {
      toast.error("Session expired", {
        description: "Please sign in again.",
      });
    }
  }, [isPoisoned]);

  const user = backendUser ?? sessionProfile;

  const authStatus = (() => {
    if (isLoadingSession) return "loading";
    if (isPoisoned) return "stale";
    if (isUnauthenticated) return "unauthenticated";
    // Authenticated with IdP session — do not wait forever on backend
    if (isAuthenticated && (user || !isLoadingUser)) {
      if (user) return "authenticated";
    }
    if (isAuthenticated && isLoadingUser) return "loading";
    if (isAuthenticated && sessionProfile) return "authenticated";
    return "idle";
  })();

  return {
    user,
    status: authStatus,
    error: isPoisoned
      ? "Session Expired"
      : fetchError && !sessionProfile
        ? fetchError
        : null,
    accessToken: session?.accessToken,
    idToken: session?.idToken,
    idp: session?.idp,
    backendSynced: Boolean(session?.backendSynced && backendUser),
    refresh: refetch,
  };
}
