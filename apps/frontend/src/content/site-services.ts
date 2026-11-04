export type SiteService = {
  slug: string;
  title: string;
  shortTitle: string;
  contactValue: string;
  eyebrow: string;
  summary: string;
  introduction: string;
  problems: string[];
  deliverables: string[];
  outcomes: string[];
  questions: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
};

export const siteServices: SiteService[] = [
  {
    slug: "website-development-kenya",
    title: "Website design & web development",
    shortTitle: "Websites & web applications",
    contactValue: "Websites & web applications",
    eyebrow: "Digital presence",
    summary: "Turn your website into a clearer, more useful path from discovery to enquiry.",
    introduction:
      "Your website is often where a potential customer decides whether to trust your business and take the next step. We design and build business websites and web applications around what visitors need to understand, what your business needs to achieve and what should happen next.",
    problems: [
      "People visit your website but do not understand what you offer.",
      "Your business is difficult to evaluate or contact online.",
      "Your current site no longer reflects the quality of your work.",
      "You need a web application that supports a real business workflow.",
    ],
    deliverables: [
      "Business and service websites",
      "Landing pages for focused campaigns",
      "Custom web applications",
      "Responsive interfaces and enquiry journeys",
      "Search-friendly page structure",
    ],
    outcomes: [
      "A clearer explanation of your offer",
      "A more straightforward path to enquiry",
      "A digital experience that works across screen sizes",
    ],
    questions: [
      {
        question: "Can you improve an existing website?",
        answer:
          "Yes. We can review the current experience, identify what is getting in the way and scope improvements before recommending a rebuild.",
      },
      {
        question: "Do I need to know exactly what to build?",
        answer:
          "No. Start with what your business is trying to achieve. We can help clarify the requirements and the most practical next step.",
      },
    ],
    metaTitle: "Website Design & Web Development in Kenya",
    metaDescription:
      "NetHub designs business websites, landing pages and web applications for Kenyan businesses, with clear messaging, responsive experiences and practical enquiry paths.",
  },
  {
    slug: "mobile-app-development",
    title: "Mobile application development",
    shortTitle: "Mobile applications",
    contactValue: "Mobile applications",
    eyebrow: "Customer and team experiences",
    summary: "Bring useful services and everyday workflows closer to the people who use them.",
    introduction:
      "A mobile application should make a task easier, not add another layer of complexity. We help shape and build mobile experiences around the people who will use them, the work they need to complete and the systems the application must connect to.",
    problems: [
      "Customers need a more convenient way to access your service.",
      "Your team relies on manual or disconnected processes.",
      "A web experience alone does not fit the way people need to use your service.",
      "You have an app idea but need help turning it into a practical scope.",
    ],
    deliverables: [
      "Customer-facing mobile applications",
      "Business and operational applications",
      "Application interfaces and user journeys",
      "Backend API and service integrations",
      "Product planning and technical scoping",
    ],
    outcomes: [
      "A focused experience built around real user tasks",
      "More convenient access to digital services",
      "A clearer plan for building and maintaining the product",
    ],
    questions: [
      {
        question: "Can you help define the app before development?",
        answer:
          "Yes. We can work through the intended users, essential tasks, integrations and constraints before deciding what belongs in the first release.",
      },
      {
        question: "Can an application connect to existing systems?",
        answer:
          "Where the existing systems provide suitable interfaces, we can assess and plan the integrations as part of the project scope.",
      },
    ],
    metaTitle: "Mobile App Development for Businesses | NetHub Kenya",
    metaDescription:
      "Plan and build mobile applications around customer needs and business workflows. NetHub helps Kenyan organisations scope useful mobile products.",
  },
  {
    slug: "seo-conversion-kenya",
    title: "SEO & conversion improvement",
    shortTitle: "SEO & conversion",
    contactValue: "SEO & conversion improvement",
    eyebrow: "Search visibility and enquiries",
    summary: "Help the right people find your business, understand your offer and take action.",
    introduction:
      "Search visibility matters when it connects your business with people who are already looking for what you offer. We work on the technical foundations, page content and visitor journey so your website is easier to discover and easier to act on.",
    problems: [
      "Your business does not appear for relevant searches.",
      "Your website attracts visits but generates few useful enquiries.",
      "Search engines struggle to understand your pages.",
      "Visitors cannot quickly find the information they need to make a decision.",
    ],
    deliverables: [
      "Technical SEO reviews and fixes",
      "On-page content and page-structure improvements",
      "Search intent and keyword mapping",
      "Local and service discovery recommendations",
      "Conversion-path and call-to-action improvements",
    ],
    outcomes: [
      "Pages that better match what potential customers search for",
      "A clearer route from search visit to enquiry",
      "A stronger technical foundation for ongoing discovery",
    ],
    questions: [
      {
        question: "How quickly will SEO improve my rankings?",
        answer:
          "There is no reliable universal timeline or ranking guarantee. Results depend on the current website, competition, search demand and the work sustained over time.",
      },
      {
        question: "Can SEO help a local business in Kenya?",
        answer:
          "Yes. We can review how your services and location are represented online and identify improvements that help relevant local customers discover you.",
      },
    ],
    metaTitle: "SEO Services & Conversion Improvement in Kenya",
    metaDescription:
      "Improve technical SEO, service-page relevance and enquiry journeys. NetHub helps Kenyan businesses become easier to discover and easier to contact.",
  },
  {
    slug: "business-technology-solutions",
    title: "Business technology & systems",
    shortTitle: "Business technology",
    contactValue: "Business technology & infrastructure",
    eyebrow: "Connected operations",
    summary: "Make your systems and processes work together around the way your business operates.",
    introduction:
      "When important work depends on spreadsheets, repeated manual steps or disconnected tools, it becomes harder to maintain a clear view of the business. We help identify where software, integrations and practical infrastructure can reduce friction and support better operations.",
    problems: [
      "The same information is entered into several systems.",
      "Important workflows depend on repetitive manual work.",
      "Your tools do not share information in a useful way.",
      "You need a clearer technical direction before investing in new systems.",
    ],
    deliverables: [
      "Business software and workflow planning",
      "System and API integrations",
      "Process automation",
      "Infrastructure and platform planning",
      "Technical reviews of existing systems",
    ],
    outcomes: [
      "Less avoidable friction between tools and teams",
      "More consistent information across workflows",
      "A practical technology plan tied to business priorities",
    ],
    questions: [
      {
        question: "Do we have to replace our current systems?",
        answer:
          "Not necessarily. We start by understanding what you already use and assess whether integration, targeted improvement or replacement makes the most sense.",
      },
      {
        question: "Can you work with an existing technical team?",
        answer:
          "We can discuss the current setup, responsibilities and gaps, then agree on a scope that complements the people and systems already in place.",
      },
    ],
    metaTitle: "Business Technology & Systems Integration | NetHub",
    metaDescription:
      "Connect business systems, improve workflows and plan practical technology changes with NetHub. Solutions shaped around how Kenyan businesses operate.",
  },
];

export function getSiteService(slug: string): SiteService | undefined {
  return siteServices.find((service) => service.slug === slug);
}
