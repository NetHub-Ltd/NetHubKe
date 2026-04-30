"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { zUserRead } from "../types/api/zod.gen";

export function useUser() {
  const { data: session, status: sessionStatus } = useSession();

  // 1. Status Derivation
  const isPoisoned = !!session?.error;
  const isUnauthenticated = sessionStatus === "unauthenticated";
  const isLoadingSession = sessionStatus === "loading";

  // 2. Fetch User Data from Backend
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: [`user-${session?.user?.id}`],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (response.status === 401) throw new Error("Unauthorized");
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userdata = await response.json();
      const parsed = zUserRead.safeParse(userdata);
      if (!parsed.success) {
        console.error("Zod Validation Errors:", parsed.error.format());
        throw new Error("Invalid user data format");
      }
      return parsed.data;
    },
    // Only run if we have a token and the session isn't poisoned
    enabled: !!session?.accessToken && !isPoisoned,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // 3. Side Effects (Toasts/Modals)
  useEffect(() => {
    if (isPoisoned) {
      toast.error("Session Expired", {
        description: "Your security token is no longer active. Please log in.",
      });
    }
  }, [isPoisoned]);

  // 4. Final Derived Status
  const authStatus = (() => {
    if (isLoadingSession || (!!session?.accessToken && isLoadingUser))
      return "loading";
    if (isPoisoned) return "stale";
    if (isUnauthenticated) return "unauthenticated";
    if (userData) return "authenticated";
    return "idle";
  })();

  return {
    user: userData, // Data from /me
    status: authStatus, // loading | stale | unauthenticated | authenticated
    error: fetchError || (isPoisoned ? "Session Expired" : null),
    accessToken: session?.accessToken,
    idToken: session?.idToken,
    refresh: refetch,
  };
}
