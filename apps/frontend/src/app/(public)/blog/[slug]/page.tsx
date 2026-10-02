import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPostsSorted, getPost } from "@/content/blog/posts";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allPostsSorted().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://nethub.co.ke/blog/${post.slug}`,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = post.related
    .map((s) => getPost(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getPost>>[];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "NetHub Kenya" },
    publisher: {
      "@type": "Organization",
      name: "NetHub Kenya",
      url: "https://nethub.co.ke",
    },
    mainEntityOfPage: `https://nethub.co.ke/blog/${post.slug}`,
  };
  const crumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const faqLd = post.faqs?.length
    ? faqPageJsonLd(post.faqs.map((f) => ({ q: f.q, a: f.a })))
    : null;
  const graph: Record<string, unknown>[] = [articleLd, crumbLd];
  if (faqLd) graph.push(faqLd);
  const jsonLdGraph = { "@context": "https://schema.org", "@graph": graph };

  return (
    <article className="container-page py-space-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="font-label-sm text-on-surface-variant">
          <Link href="/blog" className="text-primary">
            Blog
          </Link>
          {" · "}
          {post.publishedAt} · {post.readingMinutes} min read
        </p>
        <h1 className="font-headline-lg mt-space-md text-on-surface">
          {post.title}
        </h1>
        <p className="font-body-lg mt-space-md text-on-surface-variant">
          {post.description}
        </p>

        <div className="mt-space-2xl space-y-space-xl">
          {post.sections.map((section, i) => (
            <section key={i}>
              {section.heading ? (
                <h2 className="font-headline-sm mb-space-md text-on-surface">
                  {section.heading}
                </h2>
              ) : null}
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="font-body-md mb-space-md text-on-surface leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {post.faqs && post.faqs.length > 0 ? (
          <section className="card-surface mt-space-2xl">
            <h2 className="font-headline-sm mb-space-lg text-on-surface">
              Questions
            </h2>
            <dl className="space-y-space-lg">
              {post.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-label-md text-on-surface">{f.q}</dt>
                  <dd className="font-body-md mt-space-xs text-on-surface-variant">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="mt-space-2xl flex flex-wrap gap-space-md">
          {post.product === "pay" || post.product === "both" ? (
            <Link href="/products/pay" className="btn-primary">
              Explore NetPay
            </Link>
          ) : null}
          {post.product === "tawala" || post.product === "both" ? (
            <Link href="/products/tawala" className="btn-primary">
              Explore Tawala
            </Link>
          ) : null}
          <Link href="/blog" className="btn-secondary">
            All posts
          </Link>
        </section>

        {related.length > 0 ? (
          <section className="mt-space-2xl border-t border-border-subtle pt-space-xl">
            <h2 className="font-headline-sm mb-space-md text-on-surface">
              Continue reading
            </h2>
            <ul className="space-y-space-sm">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="font-label-md text-primary"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
