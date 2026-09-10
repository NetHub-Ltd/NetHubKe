"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";
import CookieBanner from "@/lib/components/cookieBanner";

/**
 * Route-aware chrome. Public marketing Navbar/Footer are hidden on
 * authenticated app routes under /dashboard so the private shell owns the UI.
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isPrivateApp = pathname.startsWith("/dashboard");

  if (isPrivateApp) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="grow outline-none pt-16"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
