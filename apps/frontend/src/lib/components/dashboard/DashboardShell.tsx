"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import type { UserRead } from "@/lib/types/api/types.gen";

type DashboardShellProps = {
  title: string;
  user?: UserRead | null;
  children: React.ReactNode;
};

/**
 * Authenticated app chrome — same gradient canvas + milky surfaces as public theme.
 */
export default function DashboardShell({
  title,
  user,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          title={title}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-space-md outline-none sm:p-space-lg lg:p-space-xl"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
