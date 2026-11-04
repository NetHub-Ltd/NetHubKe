"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hide marketing chrome on the standalone sign-in route without moving the footer client-side. */
export function SiteFooterVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/login" ? null : children;
}
