import React from "react";
import Link from "next/link";
import { services } from "@/lib/data/services";
import {
  ArrowRight,
  Code,
  Smartphone,
  Globe,
  Search,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

// Robust icon mapping using the Service type keys
const iconMap: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="w-6 h-6" />,
  Smartphone: <Smartphone className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
};

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="card-layered rounded-none mx-auto w-full mt-2">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto py-12 md:py-24">
          <h1 className="text-h1 mb-6 text-gradient">
            Our <span className="">Expertise</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            We provide the technical backbone for Kenya’s most ambitious brands.
            By combining{" "}
            <span className="text-foreground font-semibold">
              M-Pesa Daraja 3.0
            </span>{" "}
            expertise with modern software engineering, we help you scale
            securely.
          </p>
        </div>

        {/*  */}
      </section>

      <div className="py-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative card-layered border border-border p-8 rounded-3xl hover:border-brand-primary/50 transition-all hover:shadow-glow"
            >
              {/* Icon Container */}
              <div className="mb-6 w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                {iconMap[service.icon] || <Code className="w-6 h-6" />}
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
                {service.title}
              </h3>

              <p className="text-muted text-base leading-relaxed mb-8">
                {service.shortDesc}
              </p>

              {/* Feature Preview - Crucial for SEO & UX */}
              <ul className="mb-8 space-y-2">
                {service.features.slice(0, 3).map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <CheckCircle2 size={14} className="text-brand-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-sm font-bold text-brand-secondary uppercase tracking-widest">
                Explore Solution
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Semantic Section - This beats competitors on content depth */}
        <div className="p-10 rounded-3xl card-layered mt-4 border border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h2">The NetHub Advantage</h2>
              <p className="mt-4 text-muted">
                Unlike traditional agencies in Nairobi, we don&apos;t just
                deliver code. We deliver{" "}
                <span className="text-foreground">
                  Revenue-Generating Infrastructure
                </span>
                . Our team specializes in the high-stakes world of Kenyan
                Fintech and E-commerce.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border border-border">
                <span className="block text-2xl font-bold text-brand-primary">
                  100%
                </span>
                <span className="text-xs text-muted">
                  Daraja API Compliance
                </span>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border">
                <span className="block text-2xl font-bold text-brand-primary">
                  &lt;1s
                </span>
                <span className="text-xs text-muted">Average Page Load</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;