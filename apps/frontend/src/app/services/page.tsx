import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description: "Connectivity, managed digital services, and the NetHubKe identity platform.",
};

const catalog = [
  {
    title: "Enterprise connectivity",
    points: [
      "Link design for multi-site operations",
      "Monitoring and escalation paths that match how you work",
      "Clear ownership between carrier, NetHub, and your team",
    ],
  },
  {
    title: "Managed digital services",
    points: [
      "Access and workplace tooling with operational support",
      "Integration with your existing systems where it matters",
      "Rollouts planned around change, not just cutover day",
    ],
  },
  {
    title: "Identity & platform (NetHubKe)",
    points: [
      "IdP-agnostic resource server—switch providers by configuration",
      "One Bearer-token contract for website, Tawala, NetPay, and future apps",
      "User resolution to local profile and tenant data—no product-token maze",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="border-b border-line bg-nh-radial">
        <div className="nh-container nh-section">
          <p className="nh-eyebrow">Services</p>
          <h1 className="nh-title mt-3">Practical services, honest boundaries</h1>
          <p className="nh-lead mt-4">
            We focus on work that has to keep running: connectivity, managed systems, and a shared
            identity spine for every NetHub client.
          </p>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container grid gap-6 lg:grid-cols-3">
          {catalog.map((item) => (
            <article key={item.title} className="nh-card flex flex-col">
              <h2 className="font-display text-xl font-semibold text-ink">{item.title}</h2>
              <ul className="mt-4 flex-1 space-y-3 text-sm text-ink-muted">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="nh-container mt-12">
          <p className="text-sm text-ink-muted">
            Need something specific?{" "}
            <Link href="/contact" className="nh-link">
              Contact us
            </Link>{" "}
            with context—we will say clearly what fits and what does not.
          </p>
        </div>
      </section>
    </main>
  );
}
