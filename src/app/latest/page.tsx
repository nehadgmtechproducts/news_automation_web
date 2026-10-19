import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/core/categories";
import { getAllArticles } from "@/server/articles";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

/** The newest stories shown on this page. Beyond this, add pagination (see README). */
const MAX_STORIES = 48;

export const metadata: Metadata = pageMetadata({
  title: "Latest news",
  description: "Every story, newest first, each with its sources.",
  path: "/latest",
});

export default async function LatestPage() {
  const articles = (await getAllArticles()).slice(0, MAX_STORIES);

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">Latest news</h1>
      <p className="mt-2 text-ink-muted">Every story, newest first.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Chip href="/latest" active>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} href={`/category/${c.slug}`}>{c.name}</Chip>
        ))}
      </div>
      {articles.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-surface p-6 text-ink-muted">No stories yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} priority={i < 3} />
          ))}
        </div>
      )}
    </Container>
  );
}
