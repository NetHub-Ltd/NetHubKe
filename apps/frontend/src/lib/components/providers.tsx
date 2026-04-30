"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

// 1. Singleton Factory: Standard for Next.js 16
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 1-minute staleTime prevents redundant fetches on tab focus
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: Always create a fresh client per request to prevent data leaking
    return makeQueryClient();
  } else {
    // Browser: Reuse the client to maintain the cache across re-renders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider
      // This is the "Polling".
      // Every 300 seconds (5 mins), the browser will hit your /api/auth/session endpoint.
      refetchInterval={300}
      // Also sync when the user switches tabs back to your app
      refetchOnWindowFocus={true}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Sonner is inside the theme provider to inherit dark/light modes */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
