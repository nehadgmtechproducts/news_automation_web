import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
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
    <>
      <h1 className="font-serif text-4xl font-semibold">{found.name}</h1>
      <p className="mb-8 mt-2 text-muted">{found.description}</p>
      {found.articles.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-6 text-muted">
          No {found.name.toLowerCase()} stories yet. New ones appear here as soon as they are verified against
          multiple sources.
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {found.articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} priority={i === 0} />
          ))}
        </div>
      )}
    </>
  );
}
