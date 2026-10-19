import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SearchForm } from "@/components/search/SearchForm";
import { Container } from "@/components/ui/Container";
import { searchStories } from "@/server/articles";

// Search results are infinite, near-duplicate pages: tell search engines not to index them.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? "";
  const results = query ? await searchStories(query) : [];

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">Search</h1>
      <SearchForm id="page-search" defaultValue={query} className="mt-5 max-w-xl" />

      {query === "" ? (
        <p className="mt-8 text-ink-muted">Type a topic, company or headline word to search our stories.</p>
      ) : results.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-surface p-6 text-ink-muted">
          No stories matched &ldquo;{query}&rdquo;. Try fewer or different words.
        </p>
      ) : (
        <>
          <p className="mt-8 text-small text-ink-subtle" role="status">
            {results.length} {results.length === 1 ? "story" : "stories"} for &ldquo;{query}&rdquo;
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a, i) => (
              <ArticleCard key={a.id} article={a} priority={i < 3} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
