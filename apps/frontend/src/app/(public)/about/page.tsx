import React from "react";
// import Navbar from "@/components/Navbar";
import { Users, Target, Rocket, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Projects Delivered", value: "50+" },
  { label: "Uptime Guarantee", value: "99.9%" },
  { label: "Expert Developers", value: "10+" },
  { label: "Happy Clients", value: "100%" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl font-extrabold mb-8 tracking-tight">
              Driving Digital{" "}
              <span className="text-brand-primary">Transformation</span> in
              Kenya.
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed mb-6">
              NetHub was founded with a single mission: to provide Kenyan
              businesses with the high-caliber technical infrastructure usually
              reserved for global giants.
            </p>
            <p className="text-lg text-foreground/60 mb-8">
              Based in Nairobi, we understand the local landscape—from the
              intricacies of M-Pesa integration to the importance of
              mobile-first accessibility. We don't just write code; we build
              business solutions.
            </p>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-brand-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm opacity-60 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative z-10 flex items-center justify-center p-12">
              {/* Replace with an actual team or office photo */}
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-brand-primary w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">
                  Local Talent, Global Standards
                </h3>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-brand-primary/20 blur-[100px] -z-10" />
          </div>
        </div>
      </section>
    </div>
  );
}
