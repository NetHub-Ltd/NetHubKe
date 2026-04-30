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
  Zap,
} from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen">
      {/* 1. HERO: The Strategic Value Proposition */}
      <section
        id="hero-section"
        className="p-6 md:px-12 bg-background my-2 transition-all duration-300 ease-in-out"
      >
        <div className="max-w-7xl mx-auto py-12 md:py-24">
          <div className="flex flex-col items-start">
            {/* Partnership Badge */}
            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-6">
              <Zap size={14} className="text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                Your Strategic Engineering Partner
              </span>
            </div> */}

            <h1 className="text-gradient text-h1 mb-6 max-w-4xl">
              We build the systems that power Kenya&apos;s
              fastest-growing brands.
            </h1>

            <p className="text-xl md:text-2xl mb-8 transition-all duration-300 ease-in-out leading-relaxed max-w-2xl text-pretty opacity-80">
              Beyond code—we build revenue-generating infrastructure. From
              M-Pesa integrations to high-performance mobile ecosystems, we
              align engineering with your business bottom line.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <Link
                href="/services"
                className="bg-brand-secondary text-white px-10 py-5 rounded-2xl font-bold hover:shadow-glow transition-all flex items-center justify-center gap-2 group"
              >
                Scale Your Business
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/contact"
                className="border border-border bg-card/50 backdrop-blur-sm px-10 py-5 rounded-2xl font-bold hover:bg-border transition-all flex items-center justify-center gap-2 text-center"
              >
                Discuss Strategy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITIES: Outcome-Focused Solutions */}
      <section className="p-4 md:p-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto py-12 md:py-24">
          <div className="flex justify-between items-end flex-col md:flex-row mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-h2 mb-4">Engineering for Growth.</h2>
              <p className="text-lg opacity-70">
                We remove the technical bottlenecks that prevent scaling. Our
                solutions are built for high-traffic, high-conversion, and
                long-term stability.
              </p>
            </div>
            <Link
              href="/services"
              className="text-brand-primary font-bold flex items-center gap-2 hover:gap-3 transition-all group"
            >
              View Our Capabilities{" "}
              <ArrowRight size={18} className="transition-all" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fintech & M-Pesa",
                desc: "Enterprise-grade M-Pesa STK Push and Daraja 3.0 integrations. We handle the complexity of settlements so you can focus on sales.",
                icon: <CreditCard className="text-brand-primary" />,
                accent: "bg-brand-primary/10",
                stat: "99.9% Uptime",
              },
              {
                title: "High-Scale Mobile",
                desc: "Native iOS & Android apps that work offline and scale effortlessly. Optimized for the local market connectivity constraints.",
                icon: <Smartphone className="text-brand-secondary" />,
                accent: "bg-brand-secondary/10",
                stat: "Top 5% Latency",
              },
              {
                title: "Next-Gen E-Commerce",
                desc: "Headless commerce builds that load in under 2 seconds. Performance engineering designed to lower customer acquisition costs.",
                icon: <ShoppingBag className="text-brand-accent" />,
                accent: "bg-brand-accent/10",
                stat: "Sub-2s Load",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card-layered p-8 border-border hover:shadow-glow transition-all hover:-translate-y-2 group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div
                    className={`w-14 h-14 ${s.accent} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform`}
                  >
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-black tracking-tighter text-brand-primary px-2 py-1 bg-brand-primary/5 rounded border border-brand-primary/10">
                    {s.stat}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="opacity-70 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE NET-HUB EDGE: Why Engineering Matters */}
      <section className="py-32 card-layered rounded-none my-4 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">
              The Engineering Partner Your Business Deserves.
            </h2>
            <div className="space-y-10">
              {[
                {
                  label: "Performance as a Feature",
                  desc: "Every 100ms of lag costs you money. We treat speed as a non-negotiable business metric, not just a technical spec.",
                  icon: <Zap />,
                },
                {
                  label: "Compliance & Security",
                  desc: "From PCI-DSS gateway standards to the Kenya Data Protection Act, we ensure your client data and revenue are bulletproof.",
                  icon: <ShieldCheck />,
                },
                {
                  label: "Zero-Fragility Code",
                  desc: "We build scalable TypeScript systems. No technical debt. No 'spaghetti code'—just documented, enterprise-ready infrastructure.",
                  icon: <Code2 />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="mt-1 text-brand-primary transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{item.label}</h4>
                    <p className="text-sm opacity-65 leading-relaxed max-w-md">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Visual representation of a 'system' dashboard */}
            <div className="aspect-square bg-card rounded-[3rem] border border-border shadow-2xl p-10 flex flex-col justify-between overflow-hidden">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-brand-primary/20 rounded-full" />
                  <div className="h-8 w-8 rounded-full bg-brand-primary animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-border/50 rounded-full" />
                  <div className="h-3 w-[90%] bg-border/50 rounded-full" />
                  <div className="h-3 w-[70%] bg-border/50 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-surface rounded-2xl border border-border p-4">
                  <TrendingUp size={16} className="text-brand-primary mb-2" />
                  <div className="h-2 w-12 bg-brand-primary/30 rounded mb-2" />
                  <div className="h-4 w-16 bg-foreground rounded" />
                </div>
                <div className="h-24 bg-surface rounded-2xl border border-border p-4">
                  <Users size={16} className="text-brand-secondary mb-2" />
                  <div className="h-2 w-12 bg-brand-secondary/30 rounded mb-2" />
                  <div className="h-4 w-16 bg-foreground rounded" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 bg-background border border-border p-8 rounded-3xl shadow-2xl max-w-64">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    System Status
                  </p>
                  <p className="text-sm font-bold">All Systems Nominal</p>
                </div>
              </div>
              <p className="text-xs opacity-60 italic leading-snug">
                "NetHub didn't just build our app; they fixed our entire payment
                workflow."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION: The Strategy Invitation */}
      <footer className="card-layered rounded-none my-4 border-y border-border py-12 md:py-32 transition-all duration-300 ease-in-out">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
            Engineering your <br />
            <span className="text-brand-primary underline decoration-brand-primary/20">
              next million.
            </span>
          </h2>
          <p className="text-xl opacity-70 mb-12 max-w-2xl mx-auto">
            Stop treating technology as a cost center. Partner with engineers
            who understand that growth is the only metric that matters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/contact"
              className="bg-foreground text-background px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
            >
              Book Strategic Consult
            </Link>
            <a
              href="mailto:hello@nethub.co.ke"
              className="px-12 py-6 rounded-2xl font-bold text-xl border border-border hover:bg-card transition-all"
            >
              Email Direct
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Logic Component Helper
function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}