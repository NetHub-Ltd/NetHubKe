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
 * Authenticated app chrome: collapsible sidebar + top navbar + main content.
 * Owns mobile drawer state so pages stay focused on content.
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
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
