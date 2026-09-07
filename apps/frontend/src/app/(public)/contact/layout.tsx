import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact NetHub — Request a Technical Discovery",
  description:
    "Talk to NetHub engineers about M-Pesa integration, custom app development, or SEO for your Kenyan business. Response within business hours.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact NetHub Kenya",
    description:
      "Request a technical discovery call for M-Pesa, apps, or SEO projects.",
    url: "https://nethub.co.ke/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
