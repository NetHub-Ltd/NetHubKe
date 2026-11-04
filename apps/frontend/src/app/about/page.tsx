import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About NetHub",
  description: "NetHub is a business growth partner using software, digital experiences and infrastructure to help businesses move forward.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

const principles = [
  { title: "Understand before building", body: "We start by understanding the business, the people involved and the problem worth solving. The right technology follows from that." },
  { title: "Make technology earn its place", body: "A new website, app or system should have a purpose. We focus on usefulness, clarity and the value it can create." },
  { title: "Build for the real world", body: "Solutions need to work beyond a presentation. We care about reliability, maintainability and what happens after launch." },
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_70%_0%,rgba(8,145,178,0.10),transparent_45%)]">
        <div className="nh-container nh-section"><p className="nh-eyebrow">About NetHub</p><h1 className="nh-title mt-4 max-w-4xl">We're here to help businesses make more of what technology can do.</h1><p className="nh-lead mt-6">NetHub is a business growth partner powered by technology. We help organisations solve practical problems, create better customer experiences and build the digital capabilities they need to move forward.</p></div>
      </section>
      <section className="nh-section">
        <div className="nh-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="nh-eyebrow">Why we exist</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">Good technology should make business better.</h2></div><div className="space-y-5 text-base leading-relaxed text-ink-muted"><p>Businesses invest time and money in websites, software and digital tools because they expect something to improve: more customers, smoother operations, better decisions or new ways to serve people.</p><p>But technology can become another expense when it is disconnected from the actual problem. We believe the work should begin with the outcome, not with a tool looking for a reason to exist.</p><p>That's how we approach our services and the products we're building: understand the need, solve the right problem and make the result useful in everyday business.</p></div></div>
      </section>
      <section className="border-y border-line bg-canvas-soft"><div className="nh-container nh-section"><p className="nh-eyebrow">How we approach the work</p><h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Practical thinking. Useful technology. Clear outcomes.</h2><div className="mt-10 grid gap-4 md:grid-cols-3">{principles.map((principle, index) => <article key={principle.title} className="rounded-2xl border border-line bg-surface p-7"><p className="font-display text-sm font-semibold text-brand">0{index + 1}</p><h3 className="mt-5 font-display text-xl font-semibold text-ink">{principle.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-muted">{principle.body}</p></article>)}</div></div></section>
      <section className="nh-section"><div className="nh-container rounded-[2rem] bg-slate-950 px-7 py-12 text-white sm:px-12 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Let's work on what's next</p><div className="mt-4 flex flex-col justify-between gap-7 md:flex-row md:items-end"><div className="max-w-2xl"><h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Every good solution starts with a conversation.</h2><p className="mt-4 text-sm leading-relaxed text-slate-300">Tell us what you're trying to achieve. We'll help you think through the problem and the possibilities.</p></div><Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-slate-950 hover:bg-slate-100">Talk to NetHub <span aria-hidden>↗</span></Link></div></div></section>
    </main>
  );
}
