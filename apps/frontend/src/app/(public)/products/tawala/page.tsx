import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tawala — shop POS for Kenyan retail",
  description:
    "Till, stock, deni, and staff PINs for minimarts and pharmacies. Plans from KSh 1,490/month. 14-day trial on tawala.nethub.co.ke.",
  alternates: { canonical: "/products/tawala" },
};

export default function TawalaLandingPage() {
  return (
    <div className="container-page py-space-2xl">
      <div className="mx-auto max-w-3xl">
        <p className="font-label-sm text-primary mb-space-xs">NetHub product</p>
        <h1 className="font-headline-lg text-on-surface">
          Tawala — biashara yako, with a clearer till
        </h1>
        <p className="font-body-lg mt-space-md text-on-surface-variant">
          Counter-first software for Kenyan shops: cash, M-Pesa, and store credit
          in one flow; stock that moves when you sell; PIN sessions on shared
          devices. Start on the phone you already own.
        </p>
        <div className="mt-space-xl flex flex-wrap gap-space-md">
          <a
            href="https://tawala.nethub.co.ke/"
            className="btn-primary"
            rel="noopener noreferrer"
          >
            Try Tawala
          </a>
          <Link
            href="/blog/choosing-pos-software-kenya"
            className="btn-secondary"
          >
            Read: choosing POS in Kenya
          </Link>
        </div>

        <section className="mt-space-2xl grid gap-space-md sm:grid-cols-3">
          {[
            {
              t: "Minimarts & dukas",
              d: "Fast till and stock that matches the shelf.",
            },
            {
              t: "Pharmacies",
              d: "Accountable sessions and tighter inventory habits.",
            },
            {
              t: "Multi-branch",
              d: "One organisation, many counters as you grow.",
            },
          ].map((x) => (
            <div key={x.t} className="card-surface">
              <h2 className="font-headline-sm text-on-surface">{x.t}</h2>
              <p className="font-body-sm mt-space-xs text-on-surface-variant">
                {x.d}
              </p>
            </div>
          ))}
        </section>

        <section className="card-surface mt-space-xl">
          <h2 className="font-headline-sm text-on-surface">Pricing snapshot</h2>
          <p className="font-body-md mt-space-sm text-on-surface-variant">
            Plans start at <strong className="text-on-surface">KSh 1,490</strong>{" "}
            per month. Self-serve trial is 14 days with no card required—confirm
            current details on the product site.
          </p>
        </section>

        <section className="mt-space-2xl">
          <h2 className="font-headline-sm mb-space-md text-on-surface">
            Guides on this site
          </h2>
          <ul className="space-y-space-sm">
            <li>
              <Link
                href="/blog/exercise-book-stock-fails-growing-shop"
                className="font-label-md text-primary"
              >
                Why exercise-book stock fails
              </Link>
            </li>
            <li>
              <Link
                href="/blog/cash-mpesa-deni-daily-profit"
                className="font-label-md text-primary"
              >
                Cash, M-Pesa, and deni
              </Link>
            </li>
            <li>
              <Link
                href="/blog/staff-pins-shop-accountability"
                className="font-label-md text-primary"
              >
                Staff PINs and accountability
              </Link>
            </li>
            <li>
              <Link
                href="/blog/choosing-pos-software-kenya"
                className="font-label-md text-primary"
              >
                Choosing POS software in Kenya
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
