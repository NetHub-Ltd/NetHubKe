// types/service.ts
export type Service = {
  title: string;
  slug: string;
  shortDesc: string; // For the cards
  description: string; // For the full page
  icon: string; // Lucide icon name or SVG path
  features: string[];
  benefits: string[];
  pricing?: {
    label: string;
    price: string;
  }[];
  seoKeywords: string[];
};
