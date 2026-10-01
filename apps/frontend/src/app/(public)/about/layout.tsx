import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "NetHub Kenya builds digital infrastructure and M-Pesa integrations for businesses in Nairobi and across Kenya.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About NetHub Kenya",
    description:
      "Digital infrastructure and M-Pesa integration specialists based in Nairobi.",
    url: "https://nethub.co.ke/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
