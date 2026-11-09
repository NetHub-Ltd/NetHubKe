import Link from "next/link";

const exploreLinks = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(79,70,229,0.25),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(6,182,212,0.18),transparent_50%)]" aria-hidden />
      <div className="nh-container relative grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-3" aria-label="NetHub home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-lg font-bold text-white">N</span>
            <span className="font-display text-xl font-bold tracking-tight">NetHub<span className="text-cyan-300">.</span></span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">We help ambitious businesses turn digital friction into clearer customer journeys, better-operating systems and useful digital products.</p>
          <Link href="/contact" className="nh-btn-primary mt-6">Start a conversation <span aria-hidden>↗</span></Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {exploreLinks.map((item) => <li key={item.href}><Link href={item.href} className="transition-colors hover:text-white">{item.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Account</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link href="/dashboard/me" className="hover:text-white">Profile</Link></li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-slate-400">Tawala and NetPay are upcoming NetHub products.</p>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="nh-container flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NetHub. All rights reserved.</p>
          <p>Built around business needs. Based in Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
