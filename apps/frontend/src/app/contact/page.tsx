import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to NetHub about websites, applications, SEO or business technology. Share the business challenge you want to solve.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact NetHub", description: "Talk to NetHub about websites, applications, SEO or business technology.", url: "/contact" },
};

type ContactPageProps = { searchParams: Promise<{ service?: string; product?: string }> };

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const initialService = params.service ?? params.product;

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_0%,rgba(79,70,229,0.16),transparent_45%)]" aria-hidden />
        <div className="nh-container nh-section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="nh-badge">Let’s talk</p>
            <h1 className="nh-title mt-6">Tell us what you want to make better.</h1>
            <p className="nh-lead mt-6">You don’t need to arrive with a technical brief. Tell us about your business, the challenge you’re facing or the idea you want to bring to life.</p>
            <div className="mt-10 space-y-5">
              {["Start with the problem|What are you trying to improve or achieve?", "We’ll discuss possibilities|We’ll use the context you share to understand a useful next step.", "Move forward with clarity|We help you decide what belongs in the first phase of work."].map((item) => {
                const [title, body] = item.split("|");
                return (
                  <div key={title} className="flex items-start gap-4">
                    <span className="nh-icon-chip" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h7" /></svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-sm text-ink-muted">{body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ContactForm initialService={initialService} />
        </div>
      </section>
    </main>
  );
}
