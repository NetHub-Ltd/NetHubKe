"use client";

import { Menu, LogOut } from "lucide-react";
import { federatedLogout } from "@/lib/actions/logout";
import type { UserRead } from "@/lib/types/api/types.gen";

type TopNavProps = {
  title: string;
  user?: UserRead | null;
  onMenuClick: () => void;
};

/**
 * Dashboard top bar: page title, mobile menu trigger, and sign-out.
 */
export default function TopNav({ title, user, onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-outline-variant/40 bg-surface-container-lowest/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-container-lowest/80">
      <button
        type="button"
        className="inline-flex rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 truncate text-lg font-semibold text-on-surface">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {user?.full_name && (
          <span className="hidden sm:inline max-w-[10rem] truncate text-sm text-on-surface-variant">
            {user.full_name}
          </span>
        )}
        <button
          type="button"
          onClick={async () => {
            const url = await federatedLogout();
            if (url) window.location.href = url;
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:border-error hover:text-error transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
