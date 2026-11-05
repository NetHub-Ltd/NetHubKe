import Link from "next/link";

const navigationItems = [
  {
    href: "/dashboard/me",
    label: "My profile",
    description: "Your personal account details",
  },
] as const;

/** Keep the navigation limited to destinations that are implemented and usable. */
export function DashboardNavigation() {
  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current="page"
          className="group flex items-center gap-3 rounded-xl bg-brand/8 px-3 py-3 text-sm font-semibold text-brand transition-colors"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-brand/10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block">{item.label}</span>
            <span className="mt-0.5 block text-xs font-normal text-ink-muted">
              {item.description}
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
