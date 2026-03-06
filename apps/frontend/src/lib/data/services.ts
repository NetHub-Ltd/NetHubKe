import { Service } from "@/types/service";

export const services: Service[] = [
  {
    title: "M-Pesa API Integration",
    slug: "mpesa-integration-kenya",
    shortDesc:
      "Automate your revenue with seamless Lipa Na M-Pesa, C2B, and B2C payment solutions for Kenyan businesses.",
    description:
      "NetHub provides end-to-end M-Pesa Daraja API integration. From STK Push (Lipa Na M-Pesa Online) to automated C2B/B2C reconciliation, we help businesses eliminate manual payment tracking. Our solutions are built for high-concurrency, ensuring that every transaction callback is captured and logged securely.",
    icon: "CreditCard",
    features: [
      "Lipa Na M-Pesa (STK Push) Integration",
      "C2B & B2C Payment APIs Setup",
      "Instant Callback Handling & Webhooks",
      "Automated Transaction Reconciliation",
      "M-Pesa Statement Automated Downloads",
    ],
    benefits: [
      "24/7 Automated Payment Processing",
      "Reduced Human Error & Fraud Prevention",
      "Real-time Cash Flow Visibility",
      "Seamless Checkout Experience for Customers",
    ],
    pricing: [
      {
        label: "Basic Setup",
        price: "KSh 7,500",
        description: "Standard STK Push integration",
      },
      {
        label: "Full Automation",
        price: "KSh 15,000",
        description: "Callbacks + Reconciliation",
      },
      {
        label: "Enterprise",
        price: "Custom",
        description: "Multi-shortcode management",
      },
    ],
    seoKeywords: [
      "M-Pesa integration Kenya",
      "Daraja API developer Nairobi",
      "Lipa Na M-Pesa for website",
      "Safaricom M-Pesa API setup",
    ],
    faqs: [
      {
        question: "How long does M-Pesa integration take?",
        answer:
          "Standard STK Push integration typically takes 3-5 business days, including the Safaricom Daraja go-live process.",
      },
      {
        question: "Do I need a Paybill or Buy Goods till?",
        answer:
          "Yes, you need an active Safaricom Lipa Na M-Pesa shortcode (Paybill or Till Number) to go live on the Daraja API.",
      },
    ],
  },
  {
    title: "Custom App Development",
    slug: "app-development-nairobi",
    shortDesc:
      "Scalable iOS, Android, and Web applications built with a focus on the Kenyan user experience and low-bandwidth optimization.",
    description:
      "We build high-performance applications that solve real-life problems. Our apps are optimized for low-bandwidth environments and 'offline-first' functionality, ensuring a smooth experience for users across Kenya, regardless of their internet stability.",
    icon: "Smartphone",
    features: [
      "Cross-Platform Development (Flutter/React Native)",
      "Custom UI/UX Design for African Markets",
      "Robust Backend API Development",
      "AWS/Azure Cloud Hosting & Scaling",
      "USSD & SMS Integration",
    ],
    benefits: [
      "Reach Customers on any Device",
      "Modernized Business Operations",
      "Secure & Scalable Infrastructure",
      "Localized User Interface Design",
    ],
    pricing: [
      {
        label: "MVP App",
        price: "From KSh 85,000",
        description: "Core features for startups",
      },
      {
        label: "Standard App",
        price: "From KSh 150,000",
        description: "Full business integration",
      },
    ],
    seoKeywords: [
      "App developers Nairobi",
      "Mobile app development Kenya",
      "Software engineering Nairobi",
      "Custom software company Kenya",
    ],
    faqs: [
      {
        question: "Do you build for both Android and iOS?",
        answer:
          "Yes, we use cross-platform technologies like Flutter to deliver high-quality apps for both platforms simultaneously.",
      },
    ],
  },
  {
    title: "SEO & Digital Visibility",
    slug: "seo-optimization-kenya",
    shortDesc:
      "Rank #1 on Google in Kenya with localized search engine optimization strategies that drive high-intent organic traffic.",
    description:
      "Don't just build a site; get found by your target audience. Our SEO services focus on high-intent keywords that drive traffic from Nairobi, Mombasa, and across East Africa. We optimize your technical foundation to beat the competition on speed and relevance.",
    icon: "Search",
    features: [
      "Technical Core Web Vitals Audit",
      "Local SEO (Google Business Profile) Management",
      "Strategic Keyword Research for KE Market",
      "Authority Backlink Building",
      "Content Cluster Strategy",
    ],
    benefits: [
      "Consistent Flow of Organic Leads",
      "Lower Long-term Marketing Costs",
      "Increased Brand Trust & Authority",
      "Outrank Local Competitors",
    ],
    pricing: [
      {
        label: "SEO Audit",
        price: "KSh 10,000",
        description: "One-time technical deep dive",
      },
      {
        label: "Monthly Growth",
        price: "KSh 20,000/mo",
        description: "Continuous ranking improvement",
      },
    ],
    seoKeywords: [
      "SEO services Kenya",
      "Best SEO agency Nairobi",
      "Local SEO expert Kenya",
      "Google ranking services Nairobi",
    ],
    faqs: [
      {
        question: "How long does it take to see SEO results?",
        answer:
          "Typically, you will start seeing significant movement in rankings within 3 to 6 months of consistent optimization.",
      },
    ],
  },
];
