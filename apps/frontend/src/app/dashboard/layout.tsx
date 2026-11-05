import type { Metadata } from "next";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | NetHub Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * This is the authoritative route-level session check.
 * Proxy performs only an optimistic cookie-presence check before this layout.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const accountLabel =
    session.user?.name?.trim() || session.user?.email?.trim() || "NetHub account";

  return <DashboardShell accountLabel={accountLabel}>{children}</DashboardShell>;
}
