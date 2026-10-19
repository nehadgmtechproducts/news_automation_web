import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/core/categories";
import { getArticlesByCategorySlug } from "@/server/articles";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

// Every category in the taxonomy gets a page, even before it has stories.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  const found = await getArticlesByCategorySlug(category);
  if (!found) return {};
  const meta = pageMetadata({
    title: `${found.name} news`,
    description: found.description,
    path: `/category/${category}`,
  });
  // An empty category is thin content: keep it out of search indexes until it has stories.
  return found.articles.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function CategoryPage({ params }: PageProps<"/category/[category]">) {
  const { category } = await params;
  const found = await getArticlesByCategorySlug(category);
  if (!found) notFound();

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">{found.name}</h1>
      <p className="mt-2 text-ink-muted">{found.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Chip href="/">All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} href={`/category/${c.slug}`} active={c.slug === category}>{c.name}</Chip>
        ))}
      </div>
      {found.articles.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-surface p-6 text-ink-muted">
          No {found.name.toLowerCase()} stories yet. New ones appear here as soon as they are verified against
          multiple sources.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* the first row is above the fold: load those covers eagerly */}
          {found.articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} priority={i < 3} />
          ))}
        </div>
      )}
    </Container>
  );
}
