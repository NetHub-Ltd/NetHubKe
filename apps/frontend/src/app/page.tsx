import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  Code2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen ">
      <section
        id="hero-section"
        className="p-6 md:px-12 bg-background my-2  transition-all duration-300 ease-in-out "
      >
        <div className="max-w-7xl mx-auto py-12 md:py-24">
          <div className="">
            <h1 className="text-gradient text-h1 mb-6">
              We offer the solutions your business needs
            </h1>

            <p className="text-xl md:text-2xl mb-4 md:mb-8 transition-all duration-300 ease-in-out leading-relaxed max-w-2xl text-pretty">
              We don&apos;t just write code. We build workflows, systems,
              integrations, high-speed mobile apps and websites that turn users
              into loyal customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/services"
                className="bg-brand-secondary text-white px-10 py-5 rounded-2xl font-bold hover:shadow-glow transition-all flex items-center justify-center gap-2 group"
              >
                Start Your Project
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/services/mpesa-integration-kenya"
                className="border border-border bg-card/50 backdrop-blur-sm px-10 py-5 rounded-2xl font-bold hover:bg-border transition-all flex items-center justify-center gap-2"
              >
                M-Pesa API Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES: Focus on Business Outcomes */}
      <section className="p-4 md:p-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto py-12 md:py-24 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center flex-col md:flex-row">
            <div className="max-w-2xl mb-4 md:mb-8">
              <h2 className="text-h2 mb-4">Engineering Growth.</h2>
              <p className="">
                We don&apos;t just build features; we solve the technical
                bottlenecks stopping you from scaling.
              </p>
            </div>
            <Link
              href="/services"
              className="text-brand-primary  font-bold flex items-center gap-2 hover:underline mb-8 md:mb-0 transition-all"
            >
              Explore All Services <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fintech & M-Pesa",
                desc: "Automated C2B/B2C settlements with real-time reconciliation and Daraja 3.0 security.",
                icon: <CreditCard className="text-brand-primary" />,
                accent: "bg-brand-primary/10",
              },
              {
                title: "Enterprise Mobile",
                desc: "Native-feel iOS & Android apps optimized for Kenya's mobile-first infrastructure.",
                icon: <Smartphone className="text-brand-secondary" />,
                accent: "bg-brand-secondary/10",
              },
              {
                title: "E-Commerce Engines",
                desc: "High-performance digital shelves built with Next.js for sub-2s load times.",
                icon: <ShoppingBag className="text-brand-accent" />,
                accent: "bg-brand-accent/10",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card-layered p-6 md:p-8 border-border hover:shadow-glow transition-all hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 ${s.accent} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform`}
                >
                  {s.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="opacity-70 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"></div>
      </section>

      {/* 4. THE NET-HUB EDGE: Process & Reliability */}
      <section className="py-32 card-layered rounded-none my-4 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">
              Why NetHub?
            </h2>
            <div className="space-y-8">
              {[
                {
                  label: "Clean Code Guarantee",
                  desc: "Technical debt is a killer. We write documented, scalable TypeScript.",
                  icon: <Code2 />,
                },
                {
                  label: "Revenue-First Design",
                  desc: "Every pixel is placed to guide users toward the checkout button.",
                  icon: <TrendingUp />,
                },
                {
                  label: "Data Security",
                  desc: "Fully compliant with the Kenya Data Protection Act (2019).",
                  icon: <ShieldCheck />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="mt-1 text-brand-primary">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.label}</h4>
                    <p className="text-sm opacity-60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-background rounded-3xl border border-border shadow-2xl p-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="h-2 w-1/2 bg-brand-primary/20 rounded" />
                <div className="h-2 w-3/4 bg-border rounded" />
                <div className="h-2 w-2/3 bg-border rounded" />
                <div className="pt-4 flex gap-2">
                  <div className="h-8 w-24 bg-brand-primary rounded-lg" />
                  <div className="h-8 w-24 bg-surface rounded-lg border border-border" />
                </div>
              </div>
            </div>
            {/* Trust badge overlay */}
            <div className="absolute -bottom-6 -right-6 bg-card border border-brand-primary/20 p-6 rounded-2xl shadow-xl max-w-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-brand-primary" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <p className="text-xs font-bold leading-tight">
                Delivering 2.4x average ROI for clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <footer className="card-layered rounded-none my-4 border-y border-border py-12 md:py-24 transition-all duration-300 ease-in-out">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Stop guessing. <br /> Start{" "}
            <span className="text-brand-primary underline decoration-brand-primary/30">
              building.
            </span>
          </h2>
          <p className="text-xl opacity-60 mb-12 max-w-xl mx-auto">
            Ready to integrate M-Pesa, build a mobile app, or refresh your
            digital presence?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-foreground text-background px-12 py-5 rounded-2xl font-bold text-lg hover:scale-[1.03] active:scale-95 transition-all"
            >
              Book a Free Strategy Call
            </Link>
            <a
              href="mailto:hello@nethub.co.ke"
              className="px-12 py-5 rounded-2xl font-bold text-lg border border-border hover:bg-surface transition-all"
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
