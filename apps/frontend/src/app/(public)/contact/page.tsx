"use client";
import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission
    alert("Inquiry sent! Our team will contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            Let's build your{" "}
            <span className="text-brand-primary">next big thing.</span>
          </h1>
          <p className="text-xl text-foreground/60">
            Have a project in mind? Whether it's an M-Pesa integration or a
            custom app, we're ready to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="p-8 bg-card border border-border rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Contact Details</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-50 uppercase font-bold">
                      Email Us
                    </p>
                    <p className="font-medium">hello@nethub.co.ke</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-50 uppercase font-bold">
                      Call Us
                    </p>
                    <p className="font-medium">+254 7XX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-50 uppercase font-bold">
                      Location
                    </p>
                    <p className="font-medium">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border p-10 rounded-3xl shadow-soft space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70 ml-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-background border border-border p-4 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70 ml-1">
                    Work Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="john@company.com"
                    className="w-full bg-background border border-border p-4 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Service Required
                </label>
                <select className="w-full bg-background border border-border p-4 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all">
                  <option>M-Pesa API Integration</option>
                  <option>Custom App Development</option>
                  <option>Website Design</option>
                  <option>Other Digital Solutions</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Project Details
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your goals..."
                  className="w-full bg-background border border-border p-4 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20"
              >
                Send Inquiry <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
