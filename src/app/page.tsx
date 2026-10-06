import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { CATEGORIES } from "@/core/categories";
import { getAllArticles } from "@/server/articles";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

// ISR: static HTML served from cache, regenerated in the background at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  ...pageMetadata({ title: `${siteConfig.name} — ${siteConfig.tagline}`, description: siteConfig.description, path: "/" }),
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

export default async function HomePage() {
  const [lead, ...rest] = await getAllArticles();

  if (!lead) {
    return (
      <section className="py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold">No stories yet</h1>
        <p className="mt-2 text-muted">New stories appear here as soon as they are verified against multiple sources.</p>
      </section>
    );
  }

  return (
    <>
      <h1 className="sr-only">{siteConfig.name}: latest technology and AI news</h1>
      <ArticleCard article={lead} priority featured />
      {rest.length > 0 && (
        <section aria-labelledby="latest" className="mt-12 border-t border-line pt-8">
          <h2 id="latest" className="mb-6 font-serif text-2xl font-semibold">Latest</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
      <nav aria-label="Browse by topic" className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium hover:bg-background">
            {c.name}
          </Link>
        ))}
      </nav>
      <p className="mt-6 text-sm text-muted">
        Want the short version? <Link href="/watch" className="text-accent hover:underline">Watch the 45-second videos</Link>.
      </p>
    </>
  );
}
