import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas-soft">
      <div className="nh-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-lg font-semibold text-ink">NetHub</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Connectivity and digital infrastructure for teams that need reliable networks,
            clear identity, and products that work together.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/services" className="hover:text-ink">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/login" className="hover:text-ink">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/me" className="hover:text-ink">
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="nh-container flex flex-col gap-2 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NetHub. All rights reserved.</p>
          <p>Kenya · Secure by design</p>
        </div>
      </div>
    </footer>
  );
}
