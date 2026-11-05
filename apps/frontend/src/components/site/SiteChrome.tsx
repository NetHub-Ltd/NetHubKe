"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Keep marketing chrome on public pages. Login and authenticated application
 * routes provide their own focused layouts.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLegacyAccountRoute = pathname === "/me" || pathname.startsWith("/me/");
  const isFocusedPage = pathname === "/login" || isDashboardRoute || isLegacyAccountRoute;

  return (
    <>
      {!isFocusedPage && <SiteHeader />}
      {children}
      {!isFocusedPage && <SiteFooter />}
    </>
  );
}
