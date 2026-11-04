import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products",
  description: "Discover Tawala and NetPay, upcoming NetHub products being built to help businesses manage operations and payments.",
  alternates: { canonical: "/products" },
  openGraph: { url: "/products" },
};

export default function ProductsPage() {
  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_75%_0%,rgba(37,99,235,0.12),transparent_45%)]">
        <div className="nh-container nh-section">
          <p className="nh-eyebrow">Products by NetHub</p>
          <h1 className="nh-title mt-4 max-w-4xl">Useful tools for the everyday work of running a business.</h1>
          <p className="nh-lead mt-6">We’re building products around practical business needs. Here’s what we’re working on.</p>
        </div>
      </section>
      <section className="nh-section">
        <div className="nh-container grid gap-5 lg:grid-cols-2">
          <article className="nh-surface-lift overflow-hidden rounded-[1.75rem]">
            <div className="bg-slate-950 p-8 text-white sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-3xl font-bold">Tawala<span className="text-cyan-300">.</span></span>
                <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Coming soon</span>
              </div>
              <p className="mt-8 max-w-sm font-display text-2xl font-semibold leading-snug">Take control of your business.</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">Business management software we’re building to help businesses bring their day-to-day operations into better view.</p>
              <div className="mt-8 grid grid-cols-3 gap-2" aria-hidden><div className="h-16 rounded-xl border border-white/10 bg-white/5" /><div className="h-16 rounded-xl border border-white/10 bg-blue-500/30" /><div className="h-16 rounded-xl border border-white/10 bg-white/5" /></div>
            </div>
            <div className="p-8 sm:p-10"><p className="text-sm leading-relaxed text-ink-muted">Tawala is being developed for businesses that want clearer visibility and more control over how their operations run.</p><Link href="/contact?product=Tawala" className="mt-6 inline-flex text-sm font-semibold text-brand hover:underline">Ask us about Tawala <span className="ml-2" aria-hidden>↗</span></Link></div>
          </article>
          <article className="nh-surface-lift overflow-hidden rounded-[1.75rem]">
            <div className="bg-blue-700 p-8 text-white sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-3xl font-bold">NetPay<span className="text-cyan-200">.</span></span>
                <span className="rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">Coming soon</span>
              </div>
              <p className="mt-8 max-w-sm font-display text-2xl font-semibold leading-snug">Make business payments simpler.</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">Payment infrastructure we’re building to help businesses receive and manage payments through their digital services.</p>
              <div className="mt-8 flex items-center gap-2" aria-hidden><div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">↗</div><div className="h-px flex-1 bg-white/30" /><div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">✓</div></div>
            </div>
            <div className="p-8 sm:p-10"><p className="text-sm leading-relaxed text-ink-muted">NetPay is being developed as part of the NetHub product ecosystem. It is not being presented as a generally available standalone service.</p><Link href="/contact?product=NetPay" className="mt-6 inline-flex text-sm font-semibold text-brand hover:underline">Ask us about NetPay <span className="ml-2" aria-hidden>↗</span></Link></div>
          </article>
        </div>
      </section>
      <section className="border-y border-line bg-canvas-soft"><div className="nh-container nh-section flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="max-w-xl"><p className="nh-eyebrow">Have a business challenge?</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">You don’t have to wait for a product to start a conversation.</h2><p className="mt-3 text-sm leading-relaxed text-ink-muted">We also work with businesses on websites, applications, SEO and practical technology solutions.</p></div><Link href="/contact" className="nh-btn-primary shrink-0">Talk to NetHub <span aria-hidden>↗</span></Link></div></section>
    </main>
  );
}
