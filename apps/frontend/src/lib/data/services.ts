// data/services.ts
import { Service } from "@/types/service";

export const services: Service[] = [
  {
    title: "M-Pesa API Integration",
    slug: "mpesa-integration",
    shortDesc:
      "Automate your revenue with seamless Lipa Na M-Pesa, C2B, and B2C payment solutions.",
    description:
      "Nethub provides end-to-end M-Pesa Daraja API integration. From STK Push to automated reconciliation, we help Kenyan businesses eliminate manual payment tracking.",
    icon: "CreditCard",
    features: [
      "Lipa Na M-Pesa (STK Push)",
      "C2B & B2C Payment APIs",
      "Instant Callback Handling",
      "Transaction Reconciliation",
    ],
    benefits: [
      "24/7 Automated Payments",
      "Reduced Human Error",
      "Better Cash Flow Management",
    ],
    pricing: [
      { label: "Basic Setup", price: "KSh 5,000" },
      { label: "Standard (Callback)", price: "KSh 10,000" },
      { label: "Enterprise Automation", price: "KSh 20,000" },
    ],
    seoKeywords: [
      "Mpesa integration Kenya",
      "Daraja API developer",
      "Lipa na Mpesa for website",
    ],
  },
  {
    title: "Custom App Development",
    slug: "app-development",
    shortDesc:
      "Scalable iOS, Android, and Web applications built for the Kenyan user experience.",
    description:
      "We build high-performance applications that solve real-life problems. Our apps are optimized for low-bandwidth environments common in rural Kenya.",
    icon: "Smartphone",
    features: [
      "Cross-Platform (Flutter/React Native)",
      "Custom UI/UX Design",
      "Backend API Development",
      "Cloud Deployment",
    ],
    benefits: [
      "Reach customers anywhere",
      "Modernized business operations",
      "Scalable infrastructure",
    ],
    seoKeywords: [
      "App developers Nairobi",
      "Mobile app development Kenya",
      "Software engineering Nairobi",
    ],
  },
  {
    title: "SEO & Digital Visibility",
    slug: "seo-optimization",
    shortDesc:
      "Rank #1 on Google in Kenya with our localized search engine optimization strategies.",
    description:
      "Don't just build a site; get found. Our SEO services focus on high-intent keywords that drive traffic from Nairobi, Mombasa, and across East Africa.",
    icon: "Search",
    features: [
      "On-Page SEO Audit",
      "Local SEO (Google Maps)",
      "Keyword Research",
      "Technical Performance Optimization",
    ],
    benefits: [
      "Increased Organic Leads",
      "Lower Customer Acquisition Cost",
      "Higher Brand Authority",
    ],
    seoKeywords: [
      "SEO services Kenya",
      "Best SEO agency Nairobi",
      "Local SEO expert Kenya",
    ],
  },
];
