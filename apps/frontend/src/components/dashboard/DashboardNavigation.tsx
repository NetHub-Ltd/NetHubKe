"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Your home",
  },
  {
    href: "/dashboard/requests",
    label: "My requests",
    description: "Quotes & updates",
  },
  {
    href: "/dashboard/requests/new",
    label: "New request",
    description: "Ask for a quote",
  },
  {
    href: "/dashboard/me",
    label: "Profile",
    description: "Your details",
  },
  {
    href: "/dashboard/admin",
    label: "Admin inbox",
    description: "Team only",
  },
];

export function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-nh px-3 py-2.5 transition ${
              active
                ? "bg-surface text-ink ring-1 ring-line"
                : "text-ink-muted hover:bg-surface/60 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className="mt-0.5 block text-xs font-normal text-ink-muted">
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
