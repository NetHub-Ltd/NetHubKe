import React from "react";
import Link from "next/link";
import { services } from "@/app/lib/data/services";
import {
  ArrowRight,
  Code,
  Smartphone,
  Globe,
  Search,
  ShoppingBag,
  CreditCard,
} from "lucide-react";

const iconMap = {
  CreditCard: <CreditCard className="w-6 h-6" />,
  Smartphone: <Smartphone className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
};

const ServicesPage = () => {
  return (
    <div className="bg-background min-h-screen py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="max-w-2xl mb-20">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Our <span className="text-brand-primary">Expertise</span>
          </h1>
          <p className="text-xl text-foreground/60 leading-relaxed">
            We provide the technical backbone for Kenya’s most ambitious brands.
            From seamless payments to high-performance applications.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative bg-card border border-border p-8 rounded-3xl hover:border-brand-primary/50 transition-all hover:shadow-2xl hover:shadow-brand-primary/5"
            >
              <div className="mb-6 w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                {iconMap[service.icon as keyof typeof iconMap] || <Code />}
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
                {service.title}
              </h3>

              <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                {service.shortDesc}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-brand-primary uppercase tracking-wider">
                Explore Solution{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
