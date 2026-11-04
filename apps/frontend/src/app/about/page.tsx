import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Who NetHub is and how we approach connectivity, identity, and digital services.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-line">
        <div className="nh-container nh-section">
          <p className="nh-eyebrow">About</p>
          <h1 className="nh-title mt-3 max-w-3xl">A company built around reliability</h1>
          <p className="nh-lead mt-4">
            NetHub exists so organizations can connect locations, secure access, and run digital
            products without reinventing identity for every app.
          </p>
        </div>
      </section>

      <section className="nh-section border-b border-line">
        <div className="nh-container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">How we work</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-muted">
              <p>
                We prefer durable architecture over short-term shortcuts. That means IdP-agnostic
                auth, shared client contracts, and services you can operate—not only launch.
              </p>
              <p>
                When trade-offs appear, we say so. Security and correctness come before growth
                experiments that would weaken the platform.
              </p>
            </div>
          </div>
          <div className="nh-card">
            <h2 className="font-display text-lg font-semibold text-ink">Principles</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>
                <strong className="text-ink">One integration model</strong> — every client talks to
                NetHubKe the same way.
              </li>
              <li>
                <strong className="text-ink">Config over rewrites</strong> — switch identity
                providers without rebuilding the stack.
              </li>
              <li>
                <strong className="text-ink">Operator clarity</strong> — status, ownership, and next
                steps you can act on.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="nh-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              Curious whether we are a fit for your sites or product suite?
            </p>
            <Link href="/contact" className="nh-btn-primary shrink-0">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
