"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { zUserRead } from "../types/api/zod.gen";

export function useUser() {
  const { data: session, status: sessionStatus } = useSession();

  const isPoisoned = !!session?.error;
  const isUnauthenticated = sessionStatus === "unauthenticated";
  const isLoadingSession = sessionStatus === "loading";

  const {
    data: userData,
    isLoading: isLoadingUser,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: [`user-${session?.user?.id}`],
    queryFn: async () => {
      // Same-origin BFF — never call FastAPI from the browser
      const response = await fetch("/api/nethub/users/me");

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
    enabled: sessionStatus === "authenticated" && !isPoisoned,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isPoisoned) {
      toast.error("Session Expired", {
        description: "Your security token is no longer active. Please log in.",
      });
    }
  }, [isPoisoned]);

  const authStatus = (() => {
    if (isLoadingSession || (sessionStatus === "authenticated" && isLoadingUser))
      return "loading";
    if (isPoisoned) return "stale";
    if (isUnauthenticated) return "unauthenticated";
    if (userData) return "authenticated";
    return "idle";
  })();

  return {
    user: userData,
    status: authStatus,
    error: fetchError || (isPoisoned ? "Session Expired" : null),
    accessToken: session?.accessToken,
    idToken: session?.idToken,
    refresh: refetch,
  };
}
