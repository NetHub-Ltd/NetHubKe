"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Keep marketing chrome on public pages. Login and the authenticated account
 * area use focused layouts of their own instead of the public navigation.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFocusedPage = pathname === "/login" || pathname === "/me" || pathname.startsWith("/me/");

  return (
    <>
      {!isFocusedPage && <SiteHeader />}
      {children}
      {!isFocusedPage && <SiteFooter />}
    </>
  );
}
