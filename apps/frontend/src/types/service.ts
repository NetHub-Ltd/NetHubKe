// types/service.ts

// types/service.ts

export type PricingTier = {
  label: string;
  price: string;
  description?: string; // e.g., "One-time setup"
};

export type Service = {
  /** The main heading for the service (SEO optimized) */
  title: string;
  
  /** URL-friendly identifier (e.g., 'mpesa-integration-kenya') */
  slug: string;
  
  /** 150-160 characters for Google Meta Descriptions */
  shortDesc: string;
  
  /** Comprehensive service breakdown for the /services/[slug] page */
  description: string;
  
  /** Lucide-react icon name as a string */
  icon: string;
  
  /** Bullet points of technical capabilities */
  features: string[];
  
  /** Business-centric outcomes */
  benefits: string[];
  
  /** Standardized pricing for the Kenyan market */
  pricing: PricingTier[];
  
  /** Phrases for Metadata and internal search optimization */
  seoKeywords: string[];
  
  /** Optional: specific FAQ data for Google Search rich snippets */
  faqs?: {
    question: string;
    answer: string;
  }[];
};