// // app/service/[slug]/page.tsx
// import { services } from "@/lib/data/services";
// import { notFound } from "next/navigation";

// type Props = {
//   params: Promise<{ slug: string }>;
// };

// export async function generateMetadata({ params }: Props) {
//   // Await the promise to get the actual slug
//   const { slug } = await params;

//   const service = services.find((s) => s.slug === slug);
//   if (!service) return { title: "Service Not Found" };

//   return {
//     title: `${service.title} Services in Kenya`,
//     description: service.shortDesc,
//     keywords: service.seoKeywords,
//   };
// }

// export default async function ServicePage({ params }: Props) {
//   // Await the promise here as well
//   const { slug } = await params;

//   const service = services.find((s) => s.slug === slug);

//   if (!service) notFound();

//   return (
//     <article className="max-w-4xl mx-auto px-6 py-20">
//       <header className="mb-12">
//         <div className="text-brand-primary font-bold mb-2 uppercase tracking-widest text-sm">
//           NetHub Solutions
//         </div>
//         <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
//           {service.title}
//         </h1>
//         <p className="text-xl opacity-80 leading-relaxed text-pretty">
//           {service.description}
//         </p>
//       </header>

//       <div className="grid md:grid-cols-2 gap-12">
//         <section>
//           <h2 className="text-2xl font-bold mb-4">Core Features</h2>
//           <ul className="space-y-3">
//             {service.features.map((f) => (
//               <li key={f} className="flex items-center gap-2">
//                 <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
//                 {f}
//               </li>
//             ))}
//           </ul>
//         </section>

//         <section className="bg-card p-8 rounded-2xl border border-border shadow-soft">
//           <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
//           <ul className="space-y-3">
//             {service.benefits.map((b) => (
//               <li key={b} className="text-sm opacity-75 flex items-start gap-2">
//                 <span className="text-brand-primary">✓</span> {b}
//               </li>
//             ))}
//           </ul>
//           <button className="mt-8 w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-brand-primary/20">
//             Request a Quote
//           </button>
//         </section>
//       </div>
//     </article>
//   );
// }

import { services } from "@/lib/data/services";
import { notFound } from "next/navigation";
import Script from "next/script";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.title} | NetHub Kenya`,
    description: service.shortDesc,
    keywords: service.seoKeywords.join(", "),
    alternates: {
      canonical: `https://nethub.co.ke/services/${slug}`,
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) notFound();

  // 1. FAQ Schema for Rich Snippets
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      service.faqs?.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })) || [],
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="min-h-screen pb-24">
        {/* Hero Section */}
        <header className="relative py-24 bg-surface/30 border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} /> Local Expertise. Global Standards.
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter max-w-4xl leading-[1.1]">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed max-w-2xl text-pretty">
              {service.description}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left: Content Column */}
            <div className="lg:col-span-2 space-y-20">
              {/* Features Section */}
              <section>
                <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                  Technical Capabilities
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {service.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-brand-primary/30 transition-colors"
                    >
                      <CheckCircle2
                        className="text-brand-primary shrink-0 mt-1"
                        size={20}
                      />
                      <span className="font-medium text-foreground/90">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section (Visible for users + matching Schema) */}
              <section className="bg-surface p-10 rounded-3xl border border-border">
                <h2 className="text-3xl font-bold mb-8">Common Questions</h2>
                <div className="space-y-8">
                  {service.faqs?.map((faq, i) => (
                    <div key={i} className="group">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-muted leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Pricing & CTA Sidebar */}
            <aside className="space-y-8">
              <div className="sticky top-24">
                <div className="bg-card p-8 rounded-3xl border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-brand-primary" /> Service
                    Packages
                  </h3>
                  <div className="space-y-4 mb-8">
                    {service.pricing.map((tier) => (
                      <div
                        key={tier.label}
                        className="p-4 rounded-xl bg-background border border-border"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">
                            {tier.label}
                          </span>
                          <span className="text-brand-primary font-bold">
                            {tier.price}
                          </span>
                        </div>
                        <p className="text-xs text-muted italic">
                          {tier.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold hover:shadow-glow transition-all flex items-center justify-center gap-2 group">
                    Start Your Project
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                  <p className="text-center text-[10px] text-muted mt-4 uppercase tracking-widest font-medium">
                    No hidden fees • Kenyan support team
                  </p>
                </div>

                {/* Local Trust Signal */}
                <div className="mt-8 p-6 rounded-2xl bg-brand-secondary/5 border border-brand-secondary/10">
                  <p className="text-sm italic text-muted text-center">
                    &quot;NetHub delivered our M-Pesa integration in 4 days.
                    Their technical SEO expertise is unmatched in Nairobi.&quot;
                  </p>
                  <p className="text-xs font-bold text-center mt-3 text-brand-secondary">
                    — Local SME Founder
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
