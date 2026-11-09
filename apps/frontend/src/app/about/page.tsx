import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Growth Partner in Kenya",
  description: "Learn how NetHub helps Kenyan businesses solve practical challenges through digital experiences, software, SEO and business technology.",
  alternates: { canonical: "/about" },
  openGraph: { title: "NetHub | Business growth through technology", description: "NetHub helps Kenyan businesses solve practical challenges through digital experiences, software, SEO and business technology.", url: "/about" },
};

const principles = [
  { title: "Understand before building", body: "We start by understanding the business, the people involved and the problem worth solving." },
  { title: "Make technology earn its place", body: "A website, app or system should have a purpose and create useful value." },
  { title: "Build for the real world", body: "We care about reliability, maintainability and what happens after launch." },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_0%,rgba(6,182,212,0.14),transparent_45%)]" aria-hidden />
        <div className="nh-container nh-section">
          <p className="nh-badge">About NetHub</p>
          <h1 className="nh-title mt-6 max-w-4xl">We’re here to help businesses make more of what technology can do.</h1>
          <p className="nh-lead mt-6">NetHub is a business growth partner powered by technology. We help organisations solve practical problems, create better customer experiences and build the digital capabilities they need to move forward.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="nh-btn-primary">Request a practical recommendation <span aria-hidden>↗</span></Link>
            <Link href="/services" className="nh-btn-secondary">Explore services</Link>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="nh-eyebrow">Why we exist</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Good technology should make business better.</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-ink-muted">
            <p>Businesses invest in websites, software and digital tools because they expect something to improve: more customers, smoother operations, better decisions or new ways to serve people.</p>
            <p>Technology becomes another expense when it is disconnected from the actual problem. We believe the work should begin with the outcome, not with a tool looking for a reason to exist.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Practical thinking. Useful technology. Clear outcomes.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((principle, index) => (
              <article key={principle.title} className="nh-card">
                <p className="font-display text-sm font-bold text-brand">0{index + 1}</p>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">{principle.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="nh-cta-band">
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Every good solution starts with a conversation.</h2>
                <p className="mt-4 text-base leading-relaxed text-blue-100">Tell us what you’re trying to achieve. We’ll help you think through the problem and the possibilities.</p>
              </div>
              <Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-brand hover:bg-blue-50">Talk to NetHub <span aria-hidden>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
