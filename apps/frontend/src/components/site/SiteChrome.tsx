"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Keep the public navigation/footer on marketing and account pages,
 * while giving the dedicated sign-in screen the full gradient canvas.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {!isLoginPage && <SiteHeader />}
      {children}
      {!isLoginPage && <SiteFooter />}
    </>
  );
}
