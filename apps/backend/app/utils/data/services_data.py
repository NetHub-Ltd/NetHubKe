# from app.db.schemas.enums import ServiceIcon
#
# SERVICES_SEED_DATA = [
#     {
#         "title": "M-Pesa & Payments Gateway Integration",
#         "slug": "payments-gateway-integration-kenya-2026",
#         "icon": ServiceIcon.CREDIT_CARD,
#         "is_active": True,
#         "short_desc": (
#             "Seamless M-Pesa and payments gateway integration for Kenyan "
#             "ecommerce and digital platforms that drive online conversions."
#         ),
#         "description": (
#             "In Kenya’s digital economy, offering the right payment options isn’t optional — "
#             "it’s essential. We specialize in integrating Safaricom’s M-Pesa Daraja API along "
#             "with secure card and international gateway solutions like Stripe, Flutterwave, "
#             "and PayPal. This ensures your online store, booking system, or service portal "
#             "accepts payments that customers trust and complete — every time."
#         ),
#         "features": [
#             "M-Pesa STK Push, C2B & B2C API integration",
#             "Secure card payments via PCI-compliant gateways",
#             "Automatic settlement & webhook callback handling",
#             "Realtime transaction reconciliation & reporting",
#             "Mobile‑friendly checkout with fast conversions"
#         ],
#         "pricing": [
#             {
#                 "label": "Starter Integration",
#                 "price": "KSh 20,000",
#                 "description": "Basic M-Pesa integration + simple checkout support"
#             },
#             {
#                 "label": "Business Tier",
#                 "price": "KSh 45,000",
#                 "description": "M-Pesa + card gateways + reconciliation setup"
#             },
#             {
#                 "label": "Enterprise",
#                 "price": "Custom",
#                 "description": "Full gateway suite + subscriptions + analytics"
#             },
#         ],
#         "faqs": [
#             {
#                 "question": "How long does integration take?",
#                 "answer": (
#                     "Typical integration timelines range from 5–10 business days "
#                     "depending on gateway complexity and compliance approvals."
#                 ),
#             },
#             {
#                 "question": "Do I need a Paybill to integrate M-Pesa?",
#                 "answer": (
#                     "Yes — a Safaricom-approved Paybill or Till number is required "
#                     "for secure API integration."
#                 ),
#             },
#         ],
#     },
#     {
#         "title": "Web Development Services",
#         "slug": "web-development-services-kenya-2026",
#         "icon": ServiceIcon.SEARCH,
#         "is_active": True,
#         "short_desc": (
#             "Fast, SEO‑ready websites built to rank on Google and convert visitors into customers."
#         ),
#         "description": (
#             "Your website is often the first impression of your brand. We build modern, "
#             "mobile‑friendly, SEO‑optimized websites that rank well on search engines and "
#             "deliver real business results. Our web development services prioritize performance, "
#             "Core Web Vitals, semantic markup, and user experience — ensuring every page is "
#             "crawlable, discoverable, and designed to engage."
#         ),
#         "features": [
#             "Responsive & mobile‑first design for all devices",
#             "Semantic HTML and structured data (schema) for SEO",
#             "Fast load times and Core Web Vitals optimization",
#             "Custom features with secure backend APIs",
#             "Content management and analytics integration"
#         ],
#         "pricing": [
#             {
#                 "label": "Basic Website",
#                 "price": "From KSh 80,000",
#                 "description": "5‑page SEO‑ready responsive site"
#             },
#             {
#                 "label": "Business Website",
#                 "price": "From KSh 150,000",
#                 "description": "Up to 10 pages + advanced SEO setup"
#             },
#             {
#                 "label": "Enterprise Web Solution",
#                 "price": "Custom",
#                 "description": "Full web portal with integrations + analytics"
#             },
#         ],
#         "faqs": [
#             {
#                 "question": "Will my website be SEO‑optimized?",
#                 "answer": (
#                     "Yes — every website we build includes on‑page optimization, "
#                     "search‑focused structure, and performance improvements tailored for discovery."
#                 ),
#             },
#             {
#                 "question": "Do you support analytics and tracking?",
#                 "answer": (
#                     "Yes — Google Analytics, Search Console, and performance monitoring "
#                     "are included as standard."
#                 ),
#             },
#         ],
#     },
#     {
#         "title": "Mobile App Development",
#         "slug": "mobile-app-development-kenya-2026",
#         "icon": ServiceIcon.SMARTPHONE,
#         "is_active": True,
#         "short_desc": (
#             "Custom mobile applications for iOS and Android that elevate engagement and growth."
#         ),
#         "description": (
#             "In a mobile‑first market like Kenya, your business needs apps that feel native, "
#             "perform smoothly, and provide real value to users. We design and build high‑quality "
#             "mobile applications with rich user experiences, offline support, and reliable integrations "
#             "with backend systems. Whether it’s e‑commerce, services, or enterprise tools — your users "
#             "get apps that delight and retain."
#         ),
#         "features": [
#             "Native and cross‑platform development (React Native / Flutter)",
#             "Custom API and backend integration",
#             "M‑Pesa and payment gateway support",
#             "Push notifications and analytics",
#             "App store deployment and optimization"
#         ],
#         "pricing": [
#             {
#                 "label": "Starter App",
#                 "price": "From KSh 120,000",
#                 "description": "Core features and basic integrations"
#             },
#             {
#                 "label": "Professional App",
#                 "price": "From KSh 250,000",
#                 "description": "Full feature set + backend reporting"
#             },
#             {
#                 "label": "Enterprise App",
#                 "price": "Custom",
#                 "description": "Scalable solution with analytics + support"
#             },
#         ],
#         "faqs": [
#             {
#                 "question": "How long does it take to build a mobile app?",
#                 "answer": (
#                     "Depending on complexity, typical timelines can range from 8–16 weeks "
#                     "for full production builds."
#                 ),
#             },
#             {
#                 "question": "Do you publish to Play Store & App Store?",
#                 "answer": (
#                     "Yes — we prepare and submit your apps to both stores, including asset and "
#                     "metadata optimization."
#                 ),
#             },
#         ],
#     },
#     {
#         "title": "SEO & Digital Visibility Services",
#         "slug": "seo-digital-visibility-kenya-2026",
#         "icon": ServiceIcon.SEARCH,
#         "is_active": True,
#         "short_desc": (
#             "Comprehensive SEO strategies to boost your rankings, traffic, and online authority."
#         ),
#         "description": (
#             "Search Engine Optimization (SEO) is the core strategy for getting found online. "
#             "We help Kenyan businesses plan and execute SEO that increases organic traffic, "
#             "improves rankings for target keywords, and supports long‑term growth. From technical "
#             "SEO audits to keyword mapping, on‑page optimization, and mobile‑friendly best practices, "
#             "our services are designed to improve visibility where it matters most."
#         ),
#         "features": [
#             "Technical SEO and site performance optimization",
#             "Keyword research and content strategy",
#             "Mobile‑first indexing and UX optimization",
#             "Structured data and metadata implementation",
#             "Backlink and local citation building"
#         ],
#         "pricing": [
#             {
#                 "label": "SEO Starter",
#                 "price": "KSh 15,000",
#                 "description": "Technical audit and basics setup"
#             },
#             {
#                 "label": "Growth SEO",
#                 "price": "KSh 35,000",
#                 "description": "Full optimization + content support"
#             },
#             {
#                 "label": "Authority SEO",
#                 "price": "Custom",
#                 "description": "Top‑tier strategy + ongoing analytics"
#             },
#         ],
#         "faqs": [
#             {
#                 "question": "Why does SEO matter for my business?",
#                 "answer": (
#                     "SEO ensures your business appears higher in organic search results, leading "
#                     "to more qualified traffic, better engagement, and higher conversions."
#                 ),
#             },
#             {
#                 "question": "Do you offer local SEO for Kenyan markets?",
#                 "answer": (
#                     "Yes — local keyword targeting, Google Business Profile optimization, and "
#                     "regional signals are included in our services."
#                 ),
#             },
#         ],
#     },
# ]

# from app.lib.db.models import ServiceProvider, ServiceCategory
from app.db.schemas.enums import ServiceIcon

SERVICES_SEED_DATA = [
    {
        "title": "M-Pesa API & Payment Integrations",
        "slug": "m-pesa-api-integration-kenya",
        "icon": ServiceIcon.CREDIT_CARD,
        "is_active": True,
        "short_desc": (
            "Stop losing sales. Integrate M-Pesa STK Push and secure card payments "
            "to provide the seamless checkout experience your customers expect."
        ),
        "description": (
            "In Kenya, your checkout process is your biggest conversion bottleneck. "
            "We bridge the gap between your platform and Safaricom’s Daraja API. "
            "From instant STK Push prompts to automated C2B/B2C settlements, we ensure "
            "your business never misses a payment. Whether you're on Shopify, WooCommerce, "
            "or a custom React/Next.js build, we deliver a 1-click payment experience "
            "that boosts your revenue overnight."
        ),
        "features": [
            "M-Pesa STK Push (Instant Checkout) for higher conversion",
            "C2B & B2C Automation (Auto-reconciliation)",
            "Multi-Gateway Support (Stripe, PayPal, Flutterwave)",
            "Real-time SMS & Email Payment Notifications",
            "Fraud Protection & Secure Webhook Handling"
        ],
        "pricing": [
            {
                "label": "M-Pesa Lite",
                "price": "KSh 20,000",
                "description": "Perfect for small shops needing STK Push + Paybill setup"
            },
            {
                "label": "Business Pay",
                "price": "KSh 45,000",
                "description": "M-Pesa + Credit Cards + Automated Bookkeeping"
            },
            {
                "label": "Enterprise Flow",
                "price": "Custom",
                "description": "High-volume processing, Subscriptions, and Split-Payments"
            },
        ],
        "faqs": [
            {
                "question": "Can I use this with my existing Till or Paybill?",
                "answer": (
                    "Absolutely. We connect directly to your existing Safaricom "
                    "business shortcode to ensure funds go straight to your account."
                ),
            },
            {
                "question": "Will customers see an instant prompt on their phone?",
                "answer": (
                    "Yes. We implement STK Push so the PIN prompt appears automatically, "
                    "eliminating manual typing errors and abandoned carts."
                ),
            },
        ],
    },
    {
        "title": "High-Performance Web Development",
        "slug": "web-development-agency-nairobi",
        "icon": ServiceIcon.SEARCH,
        "is_active": True,
        "short_desc": (
            "We don't just build websites; we build 24/7 sales machines. "
            "SEO-optimized, ultra-fast, and designed to turn visitors into leads."
        ),
        "description": (
            "Most websites in Kenya are slow and invisible to Google. NetHub builds "
            "lightning-fast Next.js platforms that pass Core Web Vitals with flying colors. "
            "We focus on 'Conversion-First' design—guiding your users from the landing page "
            "to the 'Call Now' or 'Buy' button using psychological triggers and "
            "industry-leading UX patterns."
        ),
        "features": [
            "Blazing Fast Load Times (< 2 seconds) for lower bounce rates",
            "SEO-Ready Architecture (Schema.org & Meta Tags included)",
            "Mobile-Optimized (Fits perfectly on every smartphone)",
            "WhatsApp & Social Media Lead Integration",
            "Scalable Cloud Hosting & Free SSL Security"
        ],
        "pricing": [
            {
                "label": "Growth Starter",
                "price": "From KSh 80,000",
                "description": "Professional 5-page site to establish market authority"
            },
            {
                "label": "Corporate Pro",
                "price": "From KSh 150,000",
                "description": "Dynamic business site with custom CMS & Advanced SEO"
            },
            {
                "label": "Custom Ecosystem",
                "price": "Custom",
                "description": "Complex web applications, SaaS platforms, or Portals"
            },
        ],
        "faqs": [
            {
                "question": "How will this help me get more customers?",
                "answer": (
                    "By combining speed with SEO, we ensure you rank higher on Google "
                    "and provide a friction-less experience that keeps users from leaving."
                ),
            },
            {
                "question": "Is the website easy to update myself?",
                "answer": (
                    "Yes. We provide a user-friendly dashboard so you can change text, "
                    "images, and blog posts without touching a single line of code."
                ),
            },
        ],
    },
    {
        "title": "Mobile App Development (iOS & Android)",
        "slug": "mobile-app-developers-kenya",
        "icon": ServiceIcon.SMARTPHONE,
        "is_active": True,
        "short_desc": (
            "Put your business in your customers' pockets. Custom mobile apps "
            "built for the unique Kenyan digital landscape."
        ),
        "description": (
            "Kenya is a mobile-first nation. To truly engage your audience, you need "
            "more than a website—you need a presence. We build cross-platform apps "
            "(Flutter/React Native) that offer offline functionality, push notifications, "
            "and deep M-Pesa integration. We handle everything from UI design to "
            "Play Store and App Store publishing."
        ),
        "features": [
            "iOS & Android deployment from a single codebase",
            "Offline Mode (Crucial for users with unstable data)",
            "Push Notifications to re-engage dormant users",
            "Biometric Security (Fingerprint/Face ID)",
            "User Analytics to track behavior and sales"
        ],
        "pricing": [
            {
                "label": "MVP Launch",
                "price": "From KSh 120,000",
                "description": "Core features to get your app into the stores quickly"
            },
            {
                "label": "Scale-Up App",
                "price": "From KSh 250,000",
                "description": "Advanced features, user profiles, and full API backend"
            },
            {
                "label": "Enterprise Mobile",
                "price": "Custom",
                "description": "Mission-critical apps with high security and support"
            },
        ],
        "faqs": [
            {
                "question": "Do I need two separate apps for iPhone and Android?",
                "answer": (
                    "No. We use cross-platform technology that works beautifully on "
                    "both, saving you 40% in development and maintenance costs."
                ),
            },
            {
                "question": "Can the app work without internet?",
                "answer": (
                    "Yes. We can design key features to work offline, syncing data "
                    "automatically as soon as the user reconnects."
                ),
            },
        ],
    },
    {
        "title": "SEO & Dominant Search Visibility",
        "slug": "seo-services-kenya",
        "icon": ServiceIcon.SEARCH,
        "is_active": True,
        "short_desc": (
            "Be the first business your customers see. We rank you on Page 1 "
            "for the keywords that actually drive money."
        ),
        "description": (
            "Ranking #1 isn't about luck; it's about engineering. We specialize in "
            "Technical SEO for the Kenyan market. We analyze what your customers "
            "are typing into Google—whether it's 'Best app developers in Nairobi' "
            "or 'M-Pesa integration'—and we optimize your site to dominate those results. "
            "More visibility equals more clicks; more clicks equal more revenue."
        ),
        "features": [
            "Hyper-Local SEO (Targeting Nairobi, Mombasa, etc.)",
            "Competitor Keyword Theft (Outrank your rivals)",
            "High-Authority Backlink Building",
            "Technical Audits to fix 'Google Visibility' blockers",
            "Monthly ROI & Ranking Progress Reports"
        ],
        "pricing": [
            {
                "label": "SEO Kickstart",
                "price": "KSh 15,000",
                "description": "One-time technical cleanup and keyword strategy"
            },
            {
                "label": "Monthly Growth",
                "price": "KSh 35,000 / mo",
                "description": "Ongoing optimization and content to dominate Page 1"
            },
            {
                "label": "Market Leader",
                "price": "Custom",
                "description": "Aggressive multi-channel visibility for large brands"
            },
        ],
        "faqs": [
            {
                "question": "How long until I see results?",
                "answer": (
                    "Technical fixes show results in weeks, while keyword rankings "
                    "typically take 3–6 months to reach the top spots on Page 1."
                ),
            },
            {
                "question": "Will you help me show up on Google Maps?",
                "answer": (
                    "Yes. Local SEO and Google Business Profile optimization are "
                    "core parts of our growth packages."
                ),
            },
        ],
    },
]