// import React from "react";
// import {
//   Users,
//   Target,
//   Rocket,
//   ShieldCheck,
//   CheckCircle2,
//   MessageCircle,
// } from "lucide-react";
// import Script from "next/script";

// const stats = [
//   { label: "Successful Integrations", value: "50+" },
//   { label: "System Uptime", value: "99.9%" },
//   { label: "Tech Specialists", value: "12+" },
//   { label: "Client Satisfaction", value: "100%" },
// ];

// const aboutFaqs = [
//   {
//     question: "Where is NetHub based?",
//     answer:
//       "NetHub is a premier software engineering agency headquartered in Nairobi, Kenya, serving clients across East Africa.",
//   },
//   {
//     question: "Does NetHub offer post-integration support?",
//     answer:
//       "Yes, we provide 24/7 technical support for all our M-Pesa API and custom software solutions to ensure zero business downtime.",
//   },
// ];

// export default function AboutPage() {
//   // JSON-LD for Local Business & FAQ
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "AboutPage",
//     mainEntity: {
//       "@type": "FAQPage",
//       mainEntity: aboutFaqs.map((faq) => ({
//         "@type": "Question",
//         name: faq.question,
//         acceptedAnswer: { "@type": "Answer", text: faq.answer },
//       })),
//     },
//   };

//   return (
//     <div className="min-h-screen">
//       <Script
//         id="about-jsonld"
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       {/* Hero Section */}
//       <section className="section-padding w-full card-layered rounded-none mt-4 mx-auto px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             <div>
//               <h1 className="text-h1 mb-8 text-gradient">
//                 Driving Digital <span className="">Transformation</span> in
//                 Kenya.
//               </h1>
//               <p className="text-xl text-muted leading-relaxed mb-6">
//                 NetHub was founded to bridge the gap between local business
//                 needs and global engineering standards. We empower Kenyan brands
//                 with the technical infrastructure required to compete in a
//                 digital-first economy.
//               </p>
//               <p className="text-lg text-muted/80 mb-8 italic border-l-4 border-brand-primary pl-6">
//                 "Based in Nairobi, we specialize in high-stakes M-Pesa API
//                 integrations, custom software engineering, and technical SEO
//                 that puts your brand on the map."
//               </p>

//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-border">
//                 {stats.map((stat) => (
//                   <div key={stat.label}>
//                     <div className="text-3xl font-bold text-foreground">
//                       {stat.value}
//                     </div>
//                     <div className="text-[10px] text-brand-secondary uppercase tracking-tighter font-bold">
//                       {stat.label}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="relative group">
//               <div className="aspect-square bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative z-10 flex items-center justify-center p-12 transition-transform duration-500 group-hover:-translate-y-2">
//                 <div className="text-center">
//                   <div className="w-24 h-24 bg-brand-primary/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 group-hover:rotate-0 transition-transform">
//                     <ShieldCheck className="text-brand-primary w-12 h-12 -rotate-12 group-hover:rotate-0 transition-transform" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-foreground">
//                     ISO-Standard <br /> Code Quality
//                   </h3>
//                   <p className="text-muted mt-4 text-sm">
//                     Nairobi&apos;s most trusted engineering team.
//                   </p>
//                 </div>
//               </div>
//               <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-primary/10 blur-[120px] -z-10" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Core Values Section - Semantic Keyword Injection */}
//       <section className="card-layered mt-4 rounded-none py-12 md:py-24 transition-all duration-300 ease-in-out">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-h2">The Pillars of NetHub</h2>
//             <p className="text-muted max-w-2xl mx-auto mt-4">
//               We don&apos;t just write code; we build the future of Kenyan
//               commerce.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 title: "Local Insight",
//                 desc: "Deep understanding of M-Pesa Daraja 2.0 and the local payment ecosystem.",
//                 icon: <Target className="text-brand-primary" />,
//               },
//               {
//                 title: "Performance First",
//                 desc: "Building lightweight, high-speed apps for low-bandwidth environments.",
//                 icon: <Rocket className="text-brand-primary" />,
//               },
//               {
//                 title: "Strategic SEO",
//                 desc: "Technical visibility strategies tailored for the Nairobi search landscape.",
//                 icon: <Users className="text-brand-primary" />,
//               },
//             ].map((v, i) => (
//               <div
//                 key={i}
//                 className="bg-background p-8 rounded-2xl border border-border hover:shadow-glow transition-all"
//               >
//                 <div className="mb-4">{v.icon}</div>
//                 <h3 className="text-xl font-bold mb-2">{v.title}</h3>
//                 <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section - Final SEO Boost */}
//       <div className="card-layered py-12 md:py-24 transition-all duration-300 ease-in-out rounded-none mt-4 md:mt-8 mb-8">
//         <section className="py-24 px-6 max-w-4xl mx-auto">
//           <div className="flex items-center gap-3 mb-12">
//             <MessageCircle className="text-brand-primary" size={32} />
//             <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
//           </div>
//           <div className="space-y-6">
//             {aboutFaqs.map((faq, i) => (
//               <div
//                 key={i}
//                 className="p-6 rounded-2xl border border-border bg-card"
//               >
//                 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
//                   <CheckCircle2 size={18} className="text-brand-accent" />
//                   {faq.question}
//                 </h3>
//                 <p className="text-muted pl-7">{faq.answer}</p>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import React from "react";
import {
  Users,
  Target,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Globe,
  Cpu,
} from "lucide-react";
import Script from "next/script";

const stats = [
  { label: "High-Scale Integrations", value: "50+" },
  { label: "SLA Guaranteed Uptime", value: "99.9%" },
  { label: "Engineering Experts", value: "12+" },
  { label: "Client ROI Success", value: "100%" },
];

const aboutFaqs = [
  {
    question: "Where is NetHub Kenya located?",
    answer:
      "NetHub is a premier software engineering agency headquartered in Nairobi, Kenya. Our physical presence in the East African tech hub allows us to provide localized M-Pesa API expertise and on-site strategic consulting for regional enterprises.",
  },
  {
    question: "Does NetHub provide technical support after deployment?",
    answer:
      "Yes. We offer enterprise-grade Service Level Agreements (SLAs) including 24/7 monitoring and technical support for all M-Pesa gateways and custom cloud infrastructure to ensure zero business downtime.",
  },
  {
    question: "What industries does NetHub specialize in?",
    answer:
      "We specialize in Fintech, E-commerce, and Logistics. Our engineering team focuses on building high-concurrency systems that handle thousands of transactions per second seamlessly.",
  },
];

export default function AboutPage() {
  // Enhanced JSON-LD for Local Business & FAQ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    description:
      "About NetHub Kenya - Leading Software Engineering and M-Pesa Integration Agency in Nairobi.",
    publisher: {
      "@type": "Organization",
      name: "NetHub Kenya",
      logo: "https://nethub.co.ke/og-image.png",
    },
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
    <div className="min-h-screen bg-background">
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. ARCHITECTURAL HERO: Establishing Entity Authority */}
      <section className="py-16 md:py-32 w-full card-layered rounded-none mt-4 mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-brand-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                  The NetHub Mission
                </span>
              </div>
              <h1 className="text-h1 mb-8 text-gradient">
                Engineering the Future of <br />
                <span className="text-foreground">
                  Kenyan Digital Commerce.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 text-pretty">
                NetHub was established to solve the "Fragility Gap" in East
                Africa's tech landscape. We combine global engineering
                standards—clean code, scalable architecture, and ISO-grade
                security—with a deep, localized understanding of the M-Pesa
                ecosystem.
              </p>

              <div className="bg-card/50 border border-border p-6 rounded-2xl mb-12">
                <p className="text-lg text-foreground italic border-l-4 border-brand-primary pl-6 leading-relaxed">
                  "We don't just build software; we build the technical
                  resilience required for Kenyan brands to scale from local
                  startups to regional leaders."
                </p>
              </div>

              {/* Data-Driven Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-t border-border">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-brand-secondary uppercase tracking-widest font-black leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Engineering Credibility */}
            <div className="relative group lg:block hidden">
              <div className="aspect-square bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex items-center justify-center p-16 transition-all duration-700 group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-28 h-28 bg-brand-primary/5 rounded-[2rem] rotate-12 flex items-center justify-center mx-auto mb-8 transition-all duration-500 group-hover:rotate-0 group-hover:bg-brand-primary/10">
                    <ShieldCheck className="text-brand-primary w-14 h-14 -rotate-12 transition-all duration-500 group-hover:rotate-0" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">
                    Enterprise <br /> Engineering
                  </h3>
                  <p className="text-muted-foreground mt-4 text-sm font-medium">
                    Strict Adherence to clean code & <br /> Data Protection
                    Standards.
                  </p>
                </div>
              </div>
              {/* Decorative background elements for "Depth" */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-secondary/5 blur-[100px] -z-10" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-primary/10 blur-[120px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PILLARS: Logic & Value Injection */}
      <section className="card-layered mt-4 rounded-none py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                Our Core Architecture
              </h2>
              <p className="text-lg text-muted-foreground">
                We approach every project with an architectural mindset,
                ensuring long-term viability and immediate conversion gains.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
              <span>Nairobi, KE</span>
              <span className="h-1 w-1 bg-foreground rounded-full" />
              <span>Est. 2024</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Localized Fintech Mastery",
                desc: "Specialized integration of M-Pesa G2/G3 APIs, enabling instant STK push and automated B2C disbursement with bank-grade security.",
                icon: <Cpu className="w-8 h-8 text-brand-primary" />,
              },
              {
                title: "Engineering for Performance",
                desc: "Using Next.js and Go-Fiber to deliver sub-200ms API responses, critical for user retention in Kenya's mobile-first market.",
                icon: <Rocket className="w-8 h-8 text-brand-primary" />,
              },
              {
                title: "Technical Search Authority",
                desc: "Beyond keywords—we engineer websites with perfect Core Web Vitals and Schema architectures to dominate Nairobi's search results.",
                icon: <Globe className="w-8 h-8 text-brand-primary" />,
              },
            ].map((v, i) => (
              <div
                key={i}
                className="bg-background p-10 rounded-[2rem] border border-border hover:border-brand-primary/30 transition-all duration-500 group"
              >
                <div className="mb-6 bg-brand-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FAQ: Semantic Search Domination */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-full mb-6 text-brand-primary">
            <MessageCircle size={28} />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">Expert Insights</h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Clear answers for technical decision-makers.
          </p>
        </div>

        <div className="space-y-4">
          {aboutFaqs.map((faq, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <h3 className="text-xl font-bold mb-3 flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="text-brand-primary shrink-0 mt-0.5"
                />
                <span className="leading-snug">{faq.question}</span>
              </h3>
              <p className="text-muted-foreground pl-9 leading-relaxed text-lg">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
