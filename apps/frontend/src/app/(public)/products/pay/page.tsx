import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "NetPay — M-Pesa collections for Kenyan products",
  description:
    "Collect via M-Pesa with clearer callbacks and less Daraja ceremony. Built by NetHub Kenya for teams that need reliable collections.",
  alternates: { canonical: "/products/pay" },
};

export default function NetPayLandingPage() {
  const crumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "NetPay", path: "/products/pay" },
  ]);

  return (
    <div className="container-page py-space-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="font-label-sm text-primary mb-space-xs">NetHub product</p>
        <h1 className="font-headline-lg text-on-surface">
          NetPay — M-Pesa collections without the headache
        </h1>
        <p className="font-body-lg mt-space-md text-on-surface-variant">
          Accept payments the way Kenyans already pay. NetPay focuses on
          collections flows—prompts, status, and reconciliation—so your product
          team is not reinventing Daraja on every launch.
        </p>
        <div className="mt-space-xl flex flex-wrap gap-space-md">
          <a
            href="https://pay.nethub.co.ke/"
            className="btn-primary"
            rel="noopener noreferrer"
          >
            Open NetPay
          </a>
          <Link href="/blog/stk-push-kenya-checkout-explained" className="btn-secondary">
            Read: STK Push explained
          </Link>
        </div>

        <section className="card-surface mt-space-2xl space-y-space-md">
          <h2 className="font-headline-sm text-on-surface">Built for</h2>
          <ul className="font-body-md list-disc space-y-space-sm pl-space-lg text-on-surface-variant">
            <li>Product teams shipping Kenyan checkout</li>
            <li>Operators who need callbacks they can trust</li>
            <li>Businesses comparing direct Daraja vs a focused collections layer</li>
          </ul>
        </section>

        <section className="mt-space-2xl">
          <h2 className="font-headline-sm mb-space-md text-on-surface">
            Guides on this site
          </h2>
          <ul className="space-y-space-sm">
            <li>
              <Link
                href="/blog/stk-push-kenya-checkout-explained"
                className="font-label-md text-primary"
              >
                What STK Push actually does
              </Link>
            </li>
            <li>
              <Link
                href="/blog/daraja-vs-payment-apis-kenya"
                className="font-label-md text-primary"
              >
                Daraja vs payment APIs
              </Link>
            </li>
            <li>
              <Link
                href="/blog/mpesa-callbacks-reconciliation"
                className="font-label-md text-primary"
              >
                Callbacks and reconciliation
              </Link>
            </li>
            <li>
              <Link
                href="/blog/mpesa-sandbox-to-production-checklist"
                className="font-label-md text-primary"
              >
                Sandbox to production checklist
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
