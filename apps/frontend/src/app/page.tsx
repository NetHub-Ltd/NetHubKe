import React from "react";
import Link from "next/link";

const Homepage = () => {
const navLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Services",
    href: "/services",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand-primary/30">
      {/* --- Navigation --- */}
      {/* --- Hero Section --- */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
              Digital Excellence in Kenya
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
              We build the{" "}
              <span className="text-brand-primary">digital engine</span> for
              your business.
            </h1>
            <p className="text-xl opacity-70 mb-10 leading-relaxed max-w-2xl">
              From seamless M-Pesa integrations to enterprise-grade mobile apps,
              NetHub delivers custom software that scales with the Kenyan
              market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all">
                View Our Work
              </button>
              <button className="border border-border bg-card px-8 py-4 rounded-xl font-bold hover:bg-border transition-all">
                M-Pesa API Setup
              </button>
            </div>
          </div>
        </div>
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </header>

      {/* --- Services Grid --- */}
      <section
        id="services"
        className="py-24 bg-card/50 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Capabilities</h2>
            <p className="opacity-60">
              Tailored solutions for growth-oriented brands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1: App Dev */}
            <div className="p-8 rounded-2xl bg-background border border-border hover:border-brand-primary/50 transition-all group">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Custom App Dev</h3>
              <p className="opacity-70 text-sm leading-relaxed">
                High-performance iOS, Android, and Web apps designed for the
                local user experience.
              </p>
            </div>

            {/* Service 2: M-Pesa */}
            <div className="p-8 rounded-2xl bg-background border border-border hover:border-accent/50 transition-all group">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Fintech & Payments</h3>
              <p className="opacity-70 text-sm leading-relaxed">
                Seamless Lipa Na M-Pesa, B2B, and B2C API integrations with
                automated reconciliation.
              </p>
            </div>

            {/* Service 3: Digital Shelves */}
            <div className="p-8 rounded-2xl bg-background border border-border hover:border-brand-secondary/50 transition-all group">
              <div className="w-12 h-12 bg-brand-secondary/10 rounded-lg flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Digital Shelves</h3>
              <p className="opacity-70 text-sm leading-relaxed">
                Turn-key e-commerce platforms that convert casual browsers into
                loyal customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <footer className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            Ready to modernize?
          </h2>
          <p className="opacity-70 mb-10">
            Stop losing customers to outdated interfaces. Let’s build something
            your users will love.
          </p>
          <a
            href="mailto:hello@nethub.co.ke"
            className="inline-block bg-brand-primary text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-brand-primary/20 hover:-translate-y-1 transition-all"
          >
            Contact NetHub Today
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
