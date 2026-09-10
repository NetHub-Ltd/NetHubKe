"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

export type SidebarItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
};

const NAV_ITEMS: SidebarItem[] = [
  { name: "Profile", href: "/dashboard/profile", icon: User, enabled: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, enabled: false },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard, enabled: false },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

/**
 * Collapsible dashboard sidebar. Active route is highlighted; disabled items
 * are visible as placeholders so the shell can grow without layout churn.
 */
export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname() || "";

  const nav = (
    <nav className="flex flex-col gap-1 px-2 py-4" aria-label="Dashboard">
      {NAV_ITEMS.map((item) => {
        const active =
          item.enabled &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));
        const Icon = item.icon;
        const base =
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
        if (!item.enabled) {
          return (
            <span
              key={item.name}
              className={`${base} cursor-not-allowed text-on-surface-variant/50`}
              title="Coming soon"
              aria-disabled="true"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-outline">
                  Soon
                </span>
              )}
            </span>
          );
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onMobileClose}
            className={`${base} ${
              active
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-outline-variant/40
          bg-surface-container-lowest transition-all duration-200
          lg:static lg:z-auto
          ${collapsed ? "w-[4.5rem]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-outline-variant/40 px-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 min-w-0"
            onClick={onMobileClose}
          >
            <LayoutDashboard className="h-6 w-6 shrink-0 text-primary" />
            {!collapsed && (
              <span className="truncate font-semibold text-on-surface">
                NetHub
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="hidden lg:inline-flex rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container-high"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
