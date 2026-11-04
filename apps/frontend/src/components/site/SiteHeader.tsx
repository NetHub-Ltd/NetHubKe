"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <div className="nh-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-fg">
            N
          </span>
          NetHub
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-nh px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-surface text-ink" : "text-ink-muted hover:bg-surface/60 hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="nh-btn-ghost">
            Sign in
          </Link>
          <Link href="/contact" className="nh-btn-primary">
            Talk to us
          </Link>
        </div>

        <button
          type="button"
          className="nh-btn-secondary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
          <nav className="nh-container flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-nh px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="nh-btn-secondary mt-2" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/contact" className="nh-btn-primary" onClick={() => setOpen(false)}>
              Talk to us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
