// "use client";

// import * as React from "react";
// import { ThemeProvider } from "next-themes";
// import { SessionProvider } from "next-auth/react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "sonner";

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = React.useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 60 * 1000,
//           },
//         },
//       }),
//   );

//   return (
//     <SessionProvider>
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//           {/* Toasts are now inside the theme and query providers */}
//           <Toaster position="top-right" richColors closeButton />
//         </ThemeProvider>
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }



// "use client";

// import * as React from "react";
// import { ThemeProvider } from "next-themes";
// import { SessionProvider } from "next-auth/react";
// import {
//   QueryClient,
//   QueryClientProvider,
//   isServer,
// } from "@tanstack/react-query";
// import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
// import { Toaster } from "sonner";

// // 1. Singleton Factory: Ensures we don't recreate the client on every render
// function makeQueryClient() {
//   return new QueryClient({
//     defaultOptions: {
//       queries: {
//         // 2026 Best Practice: 1-minute staleTime avoids "flash of loading"
//         // on frequent tab switching while keeping data relatively fresh.
//         staleTime: 60 * 1000,
//         gcTime: 5 * 60 * 1000, // Garbage collect unused data after 5 mins
//         retry: 1,
//         refetchOnWindowFocus: false,
//       },
//     },
//   });
// }

// let browserQueryClient: QueryClient | undefined = undefined;

// function getQueryClient() {
//   if (isServer) {
//     // Server: Always make a new query client for every request
//     return makeQueryClient();
//   } else {
//     // Browser: Reuse the client so we don't lose the cache on re-renders
//     if (!browserQueryClient) browserQueryClient = makeQueryClient();
//     return browserQueryClient;
//   }
// }

// export function Providers({ children }: { children: React.ReactNode }) {
//   // NOTE: We avoid useState here to ensure the client is stable
//   // even if React suspends during streaming hydration.
//   const queryClient = getQueryClient();

//   return (
//     <SessionProvider>
//       <QueryClientProvider client={queryClient}>
//         {/* 2. Streaming Hydration: Critical for Next.js 15+ to show
//             data as soon as it's ready without waiting for the full page. */}
//         <ReactQueryStreamedHydration>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             {children}
//             <Toaster position="top-right" richColors closeButton />
//           </ThemeProvider>
//         </ReactQueryStreamedHydration>
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }


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
    <SessionProvider>
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