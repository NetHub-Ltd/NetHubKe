"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/services", label: "What we do" },
  { href: "/products", label: "Our products" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-xl">
      <div className="nh-container flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-ink"
          aria-label="NetHub home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-base font-bold text-white">
            N
          </span>
          NetHub<span className="text-brand">.</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand/10 text-brand" : "text-ink-muted hover:bg-canvas-soft hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="nh-btn-ghost">Sign in</Link>
          <Link href="/contact" className="nh-btn-primary">Let's talk <span aria-hidden>↗</span></Link>
        </div>

        <button
          type="button"
          className="nh-btn-secondary px-4 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span aria-hidden>{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-surface md:hidden">
          <nav className="nh-container flex flex-col gap-1 py-3" aria-label="Mobile navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink-muted hover:bg-canvas-soft hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="nh-btn-primary mt-2" onClick={() => setOpen(false)}>
              Let's talk
            </Link>
            <Link href="/login" className="nh-btn-ghost" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
