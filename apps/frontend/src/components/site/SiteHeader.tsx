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
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-canvas/85 backdrop-blur-xl">
      <div className="nh-container flex h-18 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="NetHub home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-lg font-bold text-white shadow-nh-glow">N</span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">NetHub<span className="text-brand">.</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-brand text-white shadow-nh-glow" : "text-ink-muted hover:bg-canvas-soft hover:text-ink"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="nh-btn-ghost">Sign in</Link>
          <Link href="/contact" className="nh-btn-primary">Let’s talk <span aria-hidden>↗</span></Link>
        </div>

        <button type="button" className="nh-btn-secondary px-4 md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
          <span>{open ? "Close" : "Menu"}</span>
          <span aria-hidden>{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-surface md:hidden">
          <nav className="nh-container flex flex-col gap-1 py-3" aria-label="Mobile navigation">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-brand/10 text-brand" : "text-ink-muted hover:bg-canvas-soft hover:text-ink"}`} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              );
            })}
            <Link href="/contact" className="nh-btn-primary mt-2" onClick={() => setOpen(false)}>Let’s talk</Link>
            <Link href="/login" className="nh-btn-ghost" onClick={() => setOpen(false)}>Sign in</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
