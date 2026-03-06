import React from "react";
import {
  Users,
  Target,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import Script from "next/script";

const stats = [
  { label: "Successful Integrations", value: "50+" },
  { label: "System Uptime", value: "99.9%" },
  { label: "Tech Specialists", value: "12+" },
  { label: "Client Satisfaction", value: "100%" },
];

const aboutFaqs = [
  {
    question: "Where is NetHub based?",
    answer:
      "NetHub is a premier software engineering agency headquartered in Nairobi, Kenya, serving clients across East Africa.",
  },
  {
    question: "Does NetHub offer post-integration support?",
    answer:
      "Yes, we provide 24/7 technical support for all our M-Pesa API and custom software solutions to ensure zero business downtime.",
  },
];

export default function AboutPage() {
  // JSON-LD for Local Business & FAQ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: aboutFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  };

  return (
    <div className="min-h-screen">
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="section-padding w-full card-layered rounded-none mt-4 mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-h1 mb-8 text-gradient">
                Driving Digital <span className="">Transformation</span> in
                Kenya.
              </h1>
              <p className="text-xl text-muted leading-relaxed mb-6">
                NetHub was founded to bridge the gap between local business
                needs and global engineering standards. We empower Kenyan brands
                with the technical infrastructure required to compete in a
                digital-first economy.
              </p>
              <p className="text-lg text-muted/80 mb-8 italic border-l-4 border-brand-primary pl-6">
                "Based in Nairobi, we specialize in high-stakes M-Pesa API
                integrations, custom software engineering, and technical SEO
                that puts your brand on the map."
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-border">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-brand-secondary uppercase tracking-tighter font-bold">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="aspect-square bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative z-10 flex items-center justify-center p-12 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-24 h-24 bg-brand-primary/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 group-hover:rotate-0 transition-transform">
                    <ShieldCheck className="text-brand-primary w-12 h-12 -rotate-12 group-hover:rotate-0 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    ISO-Standard <br /> Code Quality
                  </h3>
                  <p className="text-muted mt-4 text-sm">
                    Nairobi&apos;s most trusted engineering team.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-primary/10 blur-[120px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section - Semantic Keyword Injection */}
      <section className="card-layered mt-4 rounded-none py-12 md:py-24 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-h2">The Pillars of NetHub</h2>
            <p className="text-muted max-w-2xl mx-auto mt-4">
              We don&apos;t just write code; we build the future of Kenyan
              commerce.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Local Insight",
                desc: "Deep understanding of M-Pesa Daraja 2.0 and the local payment ecosystem.",
                icon: <Target className="text-brand-primary" />,
              },
              {
                title: "Performance First",
                desc: "Building lightweight, high-speed apps for low-bandwidth environments.",
                icon: <Rocket className="text-brand-primary" />,
              },
              {
                title: "Strategic SEO",
                desc: "Technical visibility strategies tailored for the Nairobi search landscape.",
                icon: <Users className="text-brand-primary" />,
              },
            ].map((v, i) => (
              <div
                key={i}
                className="bg-background p-8 rounded-2xl border border-border hover:shadow-glow transition-all"
              >
                <div className="mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Final SEO Boost */}
      <div className="card-layered py-12 md:py-24 transition-all duration-300 ease-in-out rounded-none mt-4 md:mt-8 mb-8">
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <MessageCircle className="text-brand-primary" size={32} />
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {aboutFaqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-brand-accent" />
                  {faq.question}
                </h3>
                <p className="text-muted pl-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
