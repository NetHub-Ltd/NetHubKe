"use client";
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API Latency for "Engineering" feel
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        "Inquiry encrypted and sent. Our technical lead will review your requirements within 4 business hours.",
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        {/* Header: Setting the Stage for Partnership */}
        <div className="text-left max-w-4xl mb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-12 bg-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
              Request a Technical Discovery
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1]">
            Let's architect your <br />
            <span className="text-brand-primary">digital infrastructure.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
            From high-concurrency M-Pesa gateways to enterprise mobile
            ecosystems. Tell us about your technical bottlenecks.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 items-start">
          {/* Column 1: Authority & Contact Info */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">
                Direct Channels
              </h3>
              <div className="space-y-8">
                {[
                  {
                    icon: <Mail size={20} />,
                    label: "Email Us",
                    val: "support@nethub.co.ke",
                  },
                  {
                    icon: <Phone size={20} />,
                    label: "Call Us",
                    val: "+254 783 202 527",
                  },
                  {
                    icon: <MapPin size={20} />,
                    label: "HQ Location",
                    val: "Nairobi, Kenya",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">
                        {item.label}
                      </p>
                      <p className="font-bold text-lg">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Signals Block */}
            <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-2 text-brand-primary">
                <ShieldCheck size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Client Guarantee
                </span>
              </div>
              <ul className="space-y-4">
                {[
                  "4-Hour Response Time",
                  "Technical Lead Assigned",
                  "NDA-Ready Discussion",
                  "ISO-Standard Security",
                ].map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium opacity-80"
                  >
                    <CheckCircle size={14} className="text-brand-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2 & 3: The Engineered Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="E.g. David Otieno"
                    className="w-full bg-background border border-border p-5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                    Professional Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="david@company.com"
                    className="w-full bg-background border border-border p-5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                    Inquiry Category
                  </label>
                  <select className="w-full bg-background border border-border p-5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium appearance-none">
                    <option>M-Pesa API Ecosystem</option>
                    <option>Enterprise Mobile App</option>
                    <option>Custom Cloud Middleware</option>
                    <option>Strategic Technical Audit</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                    Project Timeline
                  </label>
                  <select className="w-full bg-background border border-border p-5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium appearance-none">
                    <option>ASAP (Urgent)</option>
                    <option>1 - 3 Months</option>
                    <option>Planning Phase</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">
                  Brief Technical Requirements
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your current stack and goals..."
                  className="w-full bg-background border border-border p-5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/10 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    Encrypting... <Zap size={20} className="animate-pulse" />
                  </>
                ) : (
                  <>
                    Initialize Consult{" "}
                    <Send
                      size={20}
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                🔒 Data handled per the Kenya Data Protection Act 2019
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}