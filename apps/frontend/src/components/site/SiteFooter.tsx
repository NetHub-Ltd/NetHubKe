"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const exploreLinks = [
  { href: "/services", label: "What we do" },
  { href: "/products", label: "Our products" },
  { href: "/about", label: "About NetHub" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const pathname = usePathname();

  // Keep the sign-in screen focused and vertically centered.
  if (pathname === "/login") return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="nh-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white">
            NetHub<span className="text-cyan-400">.</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            We help businesses move forward with better digital experiences, smarter systems and
            technology built around real business needs.
          </p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white">
            Tell us what you’re working on <span aria-hidden>↗</span>
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {exploreLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Your account</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link href="/me" className="hover:text-white">Profile</Link></li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Tawala and NetPay are upcoming NetHub products.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="nh-container flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NetHub. All rights reserved.</p>
          <p>Built around business needs. Based in Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
