import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Container } from "@/components/ui/Container";
import { getAllArticles } from "@/server/articles";
import { getMostRead } from "@/server/reads";

export const revalidate = 60;

// The list changes by the minute and is empty on a new site: keep it out of search indexes.
export const metadata: Metadata = {
  title: "Most read today",
  description: "The stories readers opened most in the last 24 hours.",
  alternates: { canonical: "/most-read" },
  robots: { index: false, follow: true },
};

export default async function MostReadPage() {
  const articles = await getMostRead(await getAllArticles(), 20);

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">Most read today</h1>
      <p className="mt-2 text-ink-muted">The stories readers opened most in the last 24 hours.</p>
      {articles.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-surface p-6 text-ink-muted">
          No reads yet today. Stories appear here as readers open them.
        </p>
      ) : (
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <li key={a.id} className="relative">
              <span className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white text-small font-semibold text-brand shadow-card">
                {i + 1}
              </span>
              <ArticleCard article={a} priority={i < 3} />
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
