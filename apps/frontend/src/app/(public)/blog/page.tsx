import type { Metadata } from "next";
import Link from "next/link";
import { allPostsSorted } from "@/content/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical writing on M-Pesa collections, Daraja choices, and running Kenyan shops with clearer stock and till data.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = allPostsSorted();

  return (
    <div className="container-page py-space-2xl">
      <header className="mx-auto max-w-3xl mb-space-2xl">
        <p className="font-label-sm text-primary mb-space-xs">NetHub Kenya</p>
        <h1 className="font-headline-lg text-on-surface">Blog</h1>
        <p className="font-body-lg mt-space-md text-on-surface-variant">
          Straight talk on payments and shop operations—written for builders and
          owners, not for keyword checklists.
        </p>
      </header>

      <ul className="mx-auto flex max-w-3xl flex-col gap-space-lg">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="card-surface transition hover:border-primary/30 hover:shadow-md">
              <p className="font-label-sm text-on-surface-variant">
                {post.publishedAt} · {post.readingMinutes} min read
                {post.product !== "both" ? ` · ${post.product}` : ""}
              </p>
              <h2 className="font-headline-sm mt-space-sm text-on-surface">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-on-surface hover:text-primary no-underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="font-body-md mt-space-sm text-on-surface-variant">
                {post.description}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="font-label-md mt-space-md inline-block text-primary"
              >
                Read article
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
