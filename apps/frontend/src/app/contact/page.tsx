import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact NetHub",
  description: "Tell NetHub what you're trying to achieve. Start a conversation about websites, applications, SEO or business technology.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_75%_0%,rgba(37,99,235,0.12),transparent_45%)]">
        <div className="nh-container nh-section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="nh-eyebrow">Let's talk</p>
            <h1 className="nh-title mt-4">Tell us what you want to make better.</h1>
            <p className="nh-lead mt-6">You don't need to arrive with a technical brief. Tell us about your business, the challenge you're facing or the idea you want to bring to life.</p>
            <div className="mt-9 space-y-5 border-t border-line pt-6">
              <div>
                <p className="text-sm font-semibold text-ink">Start with the problem</p>
                <p className="mt-1 text-sm text-ink-muted">What are you trying to improve or achieve?</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">We'll discuss the possibilities</p>
                <p className="mt-1 text-sm text-ink-muted">We'll use the context you share to understand what a useful next step could look like.</p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
