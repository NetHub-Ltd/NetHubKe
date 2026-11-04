import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business growth through technology",
  description:
    "NetHub helps businesses grow with websites, web applications, mobile apps, SEO and practical technology solutions.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const challenges = [
  { number: "01", title: "Your website isn’t bringing in business", body: "Build a digital presence that gives people a reason to find you, trust you and take the next step." },
  { number: "02", title: "Your business needs better digital tools", body: "Turn manual processes and disconnected workflows into practical web and mobile experiences." },
  { number: "03", title: "You’re difficult to find online", body: "Improve how your business appears in search and make it easier for the right customers to discover you." },
  { number: "04", title: "Your systems aren’t working together", body: "Make technology more useful with connected systems, automation and dependable infrastructure." },
];

const services = [
  { title: "Websites & web applications", body: "Digital experiences designed to explain your value, earn trust and help customers act.", tag: "Build your presence" },
  { title: "Mobile applications", body: "Useful mobile products that bring your services closer to the people who need them.", tag: "Reach people anywhere" },
  { title: "SEO & conversion", body: "Help the right people discover your business, understand your offer and become customers.", tag: "Turn visibility into value" },
  { title: "Business technology", body: "Practical software, integrations and infrastructure that support the way your business works.", tag: "Make work flow better" },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_10%,rgba(37,99,235,0.13),transparent_42%)]" aria-hidden />
        <div className="nh-container grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Business growth, powered by technology</p>
            <h1 className="nh-title mt-5">Technology should move your business <span className="text-brand">forward.</span></h1>
            <p className="nh-lead mt-6">We help businesses grow through better digital experiences, smarter systems and technology that solves real problems—not just adds another tool.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="nh-btn-primary">Let’s solve something <span aria-hidden>↗</span></Link>
              <Link href="/services" className="nh-btn-secondary">Explore what we do</Link>
            </div>
            <p className="mt-7 text-sm text-ink-subtle">From your first digital presence to the systems that help you scale.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-cyan-200/50 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /><span className="text-xs font-semibold tracking-wide text-white">BUSINESS, MOVING FORWARD</span></div>
                <span className="text-xs text-slate-400">NetHub / 01</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5">
                <div className="col-span-2 rounded-2xl bg-blue-600 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Digital presence</p>
                  <p className="mt-3 font-display text-2xl font-semibold">Be found. Be trusted. Be chosen.</p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-blue-100"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Websites · SEO · Conversion</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4"><span className="text-xl text-cyan-300" aria-hidden>◈</span><p className="mt-4 text-sm font-semibold text-white">Better tools</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Web & mobile apps</p></div>
                <div className="rounded-2xl bg-white/10 p-4"><span className="text-xl text-cyan-300" aria-hidden>⌘</span><p className="mt-4 text-sm font-semibold text-white">Smarter systems</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Software & infrastructure</p></div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"><span className="text-xs text-slate-300">Built around what matters to your business</span><span className="text-cyan-300" aria-hidden>↗</span></div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-line bg-white px-5 py-4 shadow-xl sm:block"><p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Our focus</p><p className="mt-1 font-display text-lg font-semibold text-ink">Real business value.</p></div>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Start with the problem</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Technology is only useful when it makes something better.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">Every business has friction. We work with you to understand what’s getting in the way and identify where technology can make a meaningful difference.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {challenges.map((item) => <article key={item.number} className="bg-surface p-7 sm:p-9"><p className="font-display text-sm font-semibold text-brand">{item.number}</p><h3 className="mt-5 max-w-sm font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl"><p className="nh-eyebrow">What we do</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">The right solution starts with the right question.</h2></div>
            <Link href="/services" className="nh-link text-sm">Explore our services <span aria-hidden>↗</span></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map((service, index) => <article key={service.title} className="rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-brand/40"><p className="text-xs font-semibold uppercase tracking-wider text-brand">{service.tag}</p><h3 className="mt-5 font-display text-xl font-semibold text-ink">{service.title}</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">{service.body}</p><span className="mt-7 inline-flex text-sm font-semibold text-ink" aria-hidden>{String(index + 1).padStart(2, "0")} <span className="ml-2 text-brand">↗</span></span></article>)}
          </div>
        </div>
      </section>

      <section className="nh-dark-section">
        <div className="nh-container nh-section">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Built by NetHub</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">We’re building tools for the way businesses work.</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">Alongside our services, we’re developing products that solve practical business challenges.</p></div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white">Discover our products <span aria-hidden>↗</span></Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/15 bg-white/[0.06] p-7"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-2xl font-semibold text-white">Tawala</h3><span className="rounded-full border border-cyan-300/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Coming soon</span></div><p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">Business management software designed to help businesses take control of their day-to-day operations.</p></article>
            <article className="rounded-2xl border border-white/15 bg-white/[0.06] p-7"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-2xl font-semibold text-white">NetPay</h3><span className="rounded-full border border-cyan-300/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Coming soon</span></div><p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">Payment infrastructure we’re building to make it easier for businesses to receive and manage payments.</p></article>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="overflow-hidden rounded-[2rem] bg-blue-600 px-7 py-12 text-white sm:px-12 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">A good place to start</p>
            <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl"><h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Tell us what’s holding your business back.</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100">You don’t need a technical brief. Tell us what you’re trying to achieve and we’ll help you work out the next step.</p></div>
              <Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-blue-700 hover:bg-blue-50">Start a conversation <span aria-hidden>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
