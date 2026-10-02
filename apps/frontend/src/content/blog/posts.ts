/**
 * Static blog posts for NetHub Kenya marketing site.
 * Seed file — no backend CMS required. Edit here to update copy.
 */
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  product: "pay" | "tawala" | "both";
  publishedAt: string; // ISO date
  readingMinutes: number;
  tags: string[];
  /** Related slugs for internal linking */
  related: string[];
  /** Markdown-ish body as paragraphs/sections for rendering */
  sections: { heading?: string; paragraphs: string[] }[];
  faqs?: { q: string; a: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "stk-push-kenya-checkout-explained",
    title: "What STK Push actually does for a Kenyan checkout",
    description:
      "A plain-English walk through Lipa Na M-Pesa Online: the phone prompt, the PIN, the callback, and why shops prefer it to typing a till number.",
    product: "pay",
    publishedAt: "2026-09-15",
    readingMinutes: 8,
    tags: ["M-Pesa", "STK Push", "payments"],
    related: [
      "daraja-vs-payment-apis-kenya",
      "mpesa-callbacks-reconciliation",
      "mpesa-sandbox-to-production-checklist",
    ],
    sections: [
      {
        paragraphs: [
          "If you sell anything in Kenya online or on a phone, you have felt the gap between “customer says they paid” and “money is actually in the business.” STK Push—officially Lipa Na M-Pesa Online—closes that gap by putting the payment prompt on the customer’s phone instead of asking them to remember a till or paybill.",
          "This article is for owners and builders who want the mental model, not a dump of API fields. When you understand the flow, choosing tools (including NetPay at pay.nethub.co.ke) gets easier.",
        ],
      },
      {
        heading: "The customer experience in one minute",
        paragraphs: [
          "Your system decides an amount and a phone number. Safaricom sends a prompt to that handset. The customer enters their M-Pesa PIN. If they accept, funds move according to your shortcode setup. Your server should learn the outcome from Safaricom’s callback—not from a forwarded SMS screenshot.",
          "That last point matters. Manual confirmation is slow and easy to fake. Automated confirmation is what lets you release goods, unlock a subscription, or mark an invoice paid without a human in the loop.",
        ],
      },
      {
        heading: "What has to be true on the business side",
        paragraphs: [
          "You need a legitimate collection channel (paybill or till) and a way to talk to Daraja or a provider that talks to Daraja for you. Sandbox lets you practice without real money. Production needs HTTPS callbacks, careful logging, and a plan for failed or timed-out prompts.",
          "None of this replaces good product design. A clear amount, a sensible timeout message, and a way to retry still matter when the network hiccups.",
        ],
      },
      {
        heading: "Where this fits with NetPay",
        paragraphs: [
          "NetPay is NetHub’s collections surface for teams that want M-Pesa payment flows without rebuilding Daraja plumbing every time. Use this guide to understand the job; use the product when you are ready to collect in production. For deeper trade-offs between direct Daraja and hosted APIs, read our comparison of payment approaches in Kenya.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is STK Push the same as paying to a till manually?",
        a: "No. Manual till entry relies on the customer typing numbers correctly. STK Push presents the amount and merchant context on the phone and returns a structured result to your system.",
      },
      {
        q: "Do I still need Daraja knowledge?",
        a: "Someone in the chain does—either your engineers or a platform you trust. What you should not do is treat a customer SMS as the source of truth.",
      },
    ],
  },
  {
    slug: "daraja-vs-payment-apis-kenya",
    title: "Direct Daraja vs payment APIs in Kenya: when each fits",
    description:
      "A practical comparison of building on Safaricom Daraja yourself versus using APIs like Paystack, IntaSend, or Pesapal—and where a focused collections product sits.",
    product: "pay",
    publishedAt: "2026-09-18",
    readingMinutes: 10,
    tags: ["Daraja", "Paystack", "IntaSend", "architecture"],
    related: [
      "stk-push-kenya-checkout-explained",
      "mpesa-callbacks-reconciliation",
      "mpesa-sandbox-to-production-checklist",
    ],
    sections: [
      {
        paragraphs: [
          "Kenyan teams usually meet the same fork in the road: integrate Safaricom’s Daraja API directly, or adopt a payment API that wraps M-Pesa (and sometimes cards) behind a simpler interface. Neither choice is universally “best.” The right answer depends on volume, control, branding, and how much operational work you want to own.",
        ],
      },
      {
        heading: "Direct Daraja",
        paragraphs: [
          "You register on the developer portal, manage credentials, implement STK Push or C2B, expose callbacks, and reconcile results in your own database. You keep shortcode branding and avoid an extra percentage on top of Safaricom’s tariffs—but you also own token refresh, retry logic, and incident response when callbacks fail.",
          "This path suits products where payments are core infrastructure and the engineering team can treat Daraja as a first-class dependency.",
        ],
      },
      {
        heading: "Aggregators and payment APIs",
        paragraphs: [
          "Providers such as Paystack, IntaSend, and Pesapal optimise for speed to first payment. You integrate their API or plugin; they talk to M-Pesa behind the scenes. You often trade some control and a fee for less Daraja-specific code.",
          "Read their docs carefully on settlement timing, which shortcode the customer sees, and how refunds or partial failures appear in your dashboard.",
        ],
      },
      {
        heading: "A focused collections layer",
        paragraphs: [
          "Some teams want M-Pesa collections without building a full gateway or adopting a multi-country stack they will never use. That is the gap NetPay aims to fill: collections-oriented flows with clear callbacks and less ceremony than a greenfield Daraja project. Pair this article with our STK Push explainer and the go-live checklist before you choose.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I switch later?",
        a: "Yes, but plan for id mapping. Store your own payment intent id and map provider references so historical orders stay readable after a migration.",
      },
    ],
  },
  {
    slug: "mpesa-callbacks-reconciliation",
    title: "Callbacks and reconciliation: when the phone says paid but your app disagrees",
    description:
      "Why M-Pesa prompts and application state drift apart—and how to design webhooks, idempotency, and support playbooks that keep the books honest.",
    product: "pay",
    publishedAt: "2026-09-22",
    readingMinutes: 9,
    tags: ["callbacks", "reconciliation", "reliability"],
    related: [
      "stk-push-kenya-checkout-explained",
      "daraja-vs-payment-apis-kenya",
      "mpesa-sandbox-to-production-checklist",
    ],
    sections: [
      {
        paragraphs: [
          "Support tickets that start with “I paid but nothing happened” are expensive. Usually the money moved; the application never applied the result. The fix is not louder SMS reminders—it is treating the provider callback as a contract and designing for duplicates, delays, and partial failures.",
        ],
      },
      {
        heading: "What a good callback handler does",
        paragraphs: [
          "Accept the payload over HTTPS, verify authenticity according to your provider, and update payment state in an idempotent way. If Safaricom or your gateway retries the same success, you should not double-fulfil an order.",
          "Log enough to debug (request ids, amounts, masked MSISDNs) and never log secrets or full card-equivalent data. Kenya’s data protection expectations treat phone numbers as personal data—mask them in routine logs.",
        ],
      },
      {
        heading: "Reconciliation as a daily habit",
        paragraphs: [
          "At close of day, compare provider settlements or transaction exports with your internal ledger of payment intents. Gaps point to missed callbacks, wrong environment credentials, or bugs in status mapping.",
          "For shop operations that also run a till, see how Tawala thinks about cash, M-Pesa, and deni in one place—the same discipline applies: one source of truth per payment attempt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I poll if the callback is late?",
        a: "Many stacks support a status query after STK Push. Use it as a backup, not a replacement for a correct callback URL.",
      },
    ],
  },
  {
    slug: "mpesa-sandbox-to-production-checklist",
    title: "Sandbox to production: a practical M-Pesa go-live checklist",
    description:
      "A field checklist for moving Kenyan M-Pesa collections from test credentials to real customers without the usual Friday-night surprises.",
    product: "pay",
    publishedAt: "2026-09-25",
    readingMinutes: 8,
    tags: ["go-live", "checklist", "operations"],
    related: [
      "stk-push-kenya-checkout-explained",
      "daraja-vs-payment-apis-kenya",
      "mpesa-callbacks-reconciliation",
    ],
    sections: [
      {
        paragraphs: [
          "Sandbox success is not production readiness. The checklist below is the one we wish every team ran before the first real STK Push to a customer.",
        ],
      },
      {
        heading: "Before you flip the switch",
        paragraphs: [
          "Confirm shortcode, passkey, and callback URL for the live environment. Callbacks must be public HTTPS with a valid certificate. Disable sandbox URLs in config—mixed environments are a classic source of “it works on my machine” payments.",
          "Run a small real payment to a phone you control. Verify the callback body, your database row, and the customer-facing success state. Then test decline and timeout paths so support knows what the UI will say.",
        ],
      },
      {
        heading: "After go-live",
        paragraphs: [
          "Watch error rates for 48 hours. Keep a manual reconciliation path for the first week. Document who can rotate credentials and where they live (secret store, not a chat history).",
          "When collections are stable, you can invest in product UX. Until then, reliability beats cleverness.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does Safaricom go-live take?",
        a: "It varies with documentation quality and shortcode type. Build buffer into your launch plan instead of assuming same-day approval.",
      },
    ],
  },
  {
    slug: "exercise-book-stock-fails-growing-shop",
    title: "Why exercise-book stock fails as the shop grows",
    description:
      "What works for a single counter with one trusted person breaks when you add staff, branches, or faster turnover—and what to put in place instead.",
    product: "tawala",
    publishedAt: "2026-09-16",
    readingMinutes: 8,
    tags: ["inventory", "retail", "SMEs"],
    related: [
      "cash-mpesa-deni-daily-profit",
      "staff-pins-shop-accountability",
      "choosing-pos-software-kenya",
    ],
    sections: [
      {
        paragraphs: [
          "Many Kenyan shops still run stock on paper or a private Excel file. That is not laziness—it is pragmatism when the business is small. Problems start when sales get faster than the notebook, or when more than one person sells from the same shelf.",
        ],
      },
      {
        heading: "The silent failure modes",
        paragraphs: [
          "Entries lag real sales. Credit (deni) lives in someone’s head. A second branch means a second book that never quite matches. Month-end becomes an argument instead of a report.",
          "Digital inventory is not magic. It only helps if every sale hits the same system that decrements stock. That is why till and inventory belong together in tools like Tawala, rather than in three apps that never meet.",
        ],
      },
      {
        heading: "A practical transition",
        paragraphs: [
          "Start with your fastest-moving SKUs. Count them once, enter opening balances, and force every sale through the till for two weeks. Compare physical counts to the system. The gap tells you whether process or software is the bottleneck.",
          "For a fuller picture of daily profit once stock and credit are visible, read our piece on cash, M-Pesa, and deni on one till.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need a barcode scanner on day one?",
        a: "No. Many shops start with search-and-tap on a phone. Scanners help later when the catalogue is large.",
      },
    ],
  },
  {
    slug: "cash-mpesa-deni-daily-profit",
    title: "Cash, M-Pesa, and deni on one till: what daily profit really means",
    description:
      "Drawer cash is not profit. How Kenyan shops can see the day clearly when payments mix cash, M-Pesa, and customer credit.",
    product: "tawala",
    publishedAt: "2026-09-19",
    readingMinutes: 9,
    tags: ["POS", "deni", "reporting"],
    related: [
      "exercise-book-stock-fails-growing-shop",
      "staff-pins-shop-accountability",
      "choosing-pos-software-kenya",
    ],
    sections: [
      {
        paragraphs: [
          "At closing time, owners often count the notes in the drawer and call it a day. That number ignores M-Pesa that never touched the drawer, goods sold on deni, and stock that left the shelf. Real daily profit needs all three in one story.",
        ],
      },
      {
        heading: "Three ledgers, one business",
        paragraphs: [
          "Cash is physical. M-Pesa is digital and easy to under-report if staff take personal till numbers. Deni is a promise—sales today, cash maybe next week. If your system only tracks one of these, your “profit” is a guess.",
          "Tawala records cash, M-Pesa, and store credit in the same checkout flow so open credit stays visible and stock moves with the sale. That does not replace judgement about whom to trust with credit; it stops the exposure from being invisible.",
        ],
      },
      {
        heading: "Close of day without the fight",
        paragraphs: [
          "A useful close-of-day report shows sales by tender type, stock impact, and outstanding deni. Pair it with staff sessions so discounts and voids are attributable. See our article on PINs and accountability for the human side of that design.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does recording M-Pesa in the POS replace Safaricom statements?",
        a: "No. Statements remain the payment rail’s record. The POS is your operational truth for what was sold and how it was tendered.",
      },
    ],
  },
  {
    slug: "staff-pins-shop-accountability",
    title: "Staff PINs and accountability without turning the shop into a police station",
    description:
      "How shared devices and personal PIN sessions help Kenyan shop owners coach teams—without assuming software alone stops theft.",
    product: "tawala",
    publishedAt: "2026-09-23",
    readingMinutes: 7,
    tags: ["staff", "security", "operations"],
    related: [
      "exercise-book-stock-fails-growing-shop",
      "cash-mpesa-deni-daily-profit",
      "choosing-pos-software-kenya",
    ],
    sections: [
      {
        paragraphs: [
          "Most minimarts share a phone or tablet at the counter. Without sessions, every discount looks the same in the report. Personal PINs do not make people honest by themselves—but they make conversations about voided sales and missing stock specific instead of vague.",
        ],
      },
      {
        heading: "Design for coaching, not only blame",
        paragraphs: [
          "When a session shows who was on the till, you can ask better questions: Was the price wrong on the shelf? Did a regular customer negotiate? Was training unclear? Software that only supports punishment gets abandoned; software that supports clarity gets used.",
          "Tawala uses PIN sessions on shared devices for that reason. Combine them with stock counts and clear credit rules so accountability is balanced across process and people.",
        ],
      },
    ],
    faqs: [
      {
        q: "What if staff share PINs?",
        a: "That is a management issue. Rotate PINs, keep sessions short, and review anomalies. Tools support culture; they do not replace it.",
      },
    ],
  },
  {
    slug: "choosing-pos-software-kenya",
    title: "Choosing POS software in Kenya: M-Pesa, multi-branch, and what to ignore",
    description:
      "A buyer’s guide for shop owners comparing POS options—feature checklists that matter on the Kenyan counter, and marketing noise you can skip.",
    product: "tawala",
    publishedAt: "2026-09-26",
    readingMinutes: 10,
    tags: ["POS", "buying guide", "SMEs"],
    related: [
      "exercise-book-stock-fails-growing-shop",
      "cash-mpesa-deni-daily-profit",
      "staff-pins-shop-accountability",
    ],
    sections: [
      {
        paragraphs: [
          "Feature matrices for POS systems are long on purpose. Vendors highlight everything. On a Kenyan counter, a shorter list decides whether the tool survives the first month: how you take M-Pesa, whether stock stays honest, whether a second branch is possible, and whether someone answers the phone when the till freezes on a Saturday.",
        ],
      },
      {
        heading: "Must-haves for most dukas",
        paragraphs: [
          "Checkout that records cash and M-Pesa without a separate notebook. Inventory that moves when you sell. A path to multi-branch when you grow—not a full rewrite. Reporting you can read without an accountant on day one.",
          "eTIMS and fiscalisation requirements depend on your sector and current KRA rules—verify for your business type rather than assuming every “Kenya POS” badge means the same thing.",
        ],
      },
      {
        heading: "Noise you can ignore early",
        paragraphs: [
          "Exotic loyalty modules, global card networks you will not use this year, and hardware lock-in that forces a single supplier. Start with the counter workflow. Add complexity when the basics are boringly reliable.",
          "Tawala is built around that sequence: phone-first till, stock, deni, staff PINs, then multi-branch on higher plans. Compare it against your notebook—not against an enterprise brochure—and trial with real SKUs before you commit.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I wait for the ‘perfect’ POS?",
        a: "No. Waiting on paper has a cost. Pick a system you can trial, measure stock variance for two weeks, and decide with data.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function allPostsSorted(): BlogPost[] {
  return [...blogPosts].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
}
