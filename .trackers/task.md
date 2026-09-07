# Task: GHCR build + auto-tag on master/main

- Replace Docker Hub workflow with GHCR
- Auto tag 0.0.<run_number> + latest + sha on push to master/main
- Document in apps/backend/IMAGE.md
# Current Task

- **Task name:** SEO P0 Foundations
- **Goal:** Fix crawlability, server-render commercial pages, unique metadata, honest structured data
- **Tier:** 2
- **Approved scope:** As per proposal (robots, sitemap, services SSR, metadata, schema hygiene, OG compress)
- **Completed changes:**
  - apps/frontend/src/app/robots.ts
  - apps/frontend/src/app/sitemap.ts
  - apps/frontend/src/lib/seo.ts (ProfessionalService, robots, no fake ratings, jpg OG)
  - apps/frontend/src/app/(public)/services/page.tsx (Server Component + metadata)
  - apps/frontend/src/app/(public)/services/[slug]/page.tsx (SSR + generateStaticParams + generateMetadata + FAQ schema)
  - apps/frontend/src/app/(public)/about/layout.tsx (metadata)
  - apps/frontend/src/app/(public)/contact/layout.tsx (metadata)
  - apps/frontend/public/og-image.jpg (compressed)
- **Remaining:** PR to dev, verification notes
- **Out of scope (honored):** Backend, k3s, new content pages, auth/dashboard
- **Debt introduced:** None intentional. Service list temporarily uses static data instead of live API (approved default A).
- **Design decisions:** Static catalogue for sitemap + SSR content; hybrid icon mapping for ServiceCard.
