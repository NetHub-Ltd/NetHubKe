import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact NetHub about connectivity, services, or platform integration.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-line">
        <div className="nh-container nh-section grid gap-12 lg:grid-cols-2">
          <div>
            <p className="nh-eyebrow">Contact</p>
            <h1 className="nh-title mt-3">Tell us what you are solving</h1>
            <p className="nh-lead mt-4">
              Share a short brief—sites, users, timeline, or product constraints. We respond with a
              concrete next step.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-ink">Response</dt>
                <dd className="text-ink-muted">Typically within one business day</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Best for</dt>
                <dd className="text-ink-muted">
                  Connectivity design, managed services, and NetHubKe / IdP integration questions
                </dd>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
