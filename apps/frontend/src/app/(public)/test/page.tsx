"use client";

import React from "react";
import {
  Zap,
  Code2,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Database,
} from "lucide-react";

export default function ThemeTestPage() {
  return (
    <main className="min-h-screen">
      {/* 1. Typography & Hero Test Section */}
      <section className="section-padding flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Zap size={14} className="fill-brand-primary" /> System Design v4.0
        </div>
        <h1 className="text-h1 mb-6">
          Testing Our <span className="text-gradient">Fluid Type</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-80 mb-10">
          This text should scale perfectly from a smartphone to a 4K monitor.
          The heading above uses{" "}
          <code className="bg-muted/10 px-2 py-1 rounded text-brand-primary">
            text-h1
          </code>
          .
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn-primary">Primary Action</button>
          <button className="px-6 py-3 rounded-xl font-bold border border-border hover:bg-background transition-all active:scale-95">
            Secondary Action
          </button>
        </div>
      </section>

      {/* 2. Layered UI & Card Test */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-h2 mb-4">The Layered UI</h2>
            <p className="text-muted">
              These cards use{" "}
              <code className="text-foreground font-mono">.card-layered</code>{" "}
              to sit on top of the{" "}
              <code className="text-foreground font-mono">.surface</code> color.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Web Dev",
                icon: <Code2 />,
                desc: "High-performance Next.js engines.",
              },
              {
                title: "Mobile Apps",
                icon: <Smartphone />,
                desc: "Native iOS and Android excellence.",
              },
              {
                title: "Integrations",
                icon: <Database />,
                desc: "Complex M-Pesa & API workflows.",
              },
            ].map((card, i) => (
              <div key={i} className="card-layered p-8">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
                  {card.icon}
                </div>
                <h3 className="text-h3 mb-3">{card.title}</h3>
                <p className="mb-6">{card.desc}</p>
                <div className="flex items-center gap-2 text-brand-primary font-bold text-sm group cursor-pointer">
                  Explore Tech{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Form & Input Test Section */}
      <section className="section-padding max-w-3xl mx-auto">
        <h2 className="text-h2 mb-10 text-center">Interactive Elements</h2>
        <div className="card-layered p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@nethub.co.ke"
                className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-accent/5 border border-brand-accent/20">
              <CheckCircle2 className="text-brand-accent" size={20} />
              <span className="text-sm font-medium">
                Data encryption active (Kenya Data Protection Act Compliant)
              </span>
            </div>
          </div>

          <button className="w-full btn-primary py-4">Send Message</button>
        </div>
      </section>

      {/* 4. Color Palette Verification */}
      <section className="section-padding border-t border-border bg-surface/20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-h3 mb-8">System Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-brand-primary text-white text-xs font-bold">
              Primary
            </div>
            <div className="p-4 rounded-xl bg-brand-secondary text-white text-xs font-bold">
              Secondary
            </div>
            <div className="p-4 rounded-xl bg-brand-accent text-white text-xs font-bold">
              Accent
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border text-foreground text-xs font-bold">
              Surface
            </div>
            <div className="p-4 rounded-xl bg-background border border-border text-foreground text-xs font-bold">
              Background
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
