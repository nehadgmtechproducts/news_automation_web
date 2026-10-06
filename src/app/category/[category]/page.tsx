import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { getArticlesByCategorySlug, getCategories } from "@/server/articles";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  const found = await getArticlesByCategorySlug(category);
  if (!found) return {};
  return pageMetadata({
    title: `${found.name} news`,
    description: `Sourced ${found.name.toLowerCase()} stories, each with a short read and a 45-second video.`,
    path: `/category/${category}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/category/[category]">) {
  const { category } = await params;
  const found = await getArticlesByCategorySlug(category);
  if (!found) notFound();

  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-semibold">{found.name}</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {found.articles.map((a, i) => (
          <ArticleCard key={a.id} article={a} priority={i === 0} />
        ))}
      </div>
    </>
  );
}
