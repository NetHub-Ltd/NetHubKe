import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact NetHub Kenya about M-Pesa integration, APIs, or custom applications. We respond within business hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact NetHub Kenya",
    description:
      "Request a conversation about M-Pesa, APIs, or application projects.",
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
