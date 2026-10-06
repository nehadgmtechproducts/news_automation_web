import "server-only";
import { cache } from "react";
import type { Article } from "@/core/article";
import { CATEGORIES, categoryBySlug } from "@/core/categories";
import { FileArticleRepository } from "./file-repository";
import type { ArticleRepository } from "./repository";

/**
 * Composition root: the only place that picks a concrete repository.
 * `cache()` dedupes within one render pass, so `generateMetadata` and the page body
 * asking for the same article trigger a single read, not two.
 */
const repository: ArticleRepository = new FileArticleRepository();

export const getAllArticles = cache(() => repository.list());

export const getArticle = cache((slug: string) => repository.bySlug(slug));

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => score(b, article) - score(a, article))
    .slice(0, limit);
}

function score(candidate: Article, base: Article): number {
  let s = 0;
  if (candidate.category === base.category) s += 2;
  if (candidate.entity === base.entity) s += 3;
  s += candidate.keywords.filter((k) => base.keywords.includes(k)).length;
  return s;
}

export async function getVideoArticles(): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.video);
}

export type CategorySummary = { name: string; slug: string; description: string; count: number };

/** Every category in the taxonomy, with its story count (possibly 0). */
export async function getCategories(): Promise<CategorySummary[]> {
  const all = await getAllArticles();
  return CATEGORIES.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: all.filter((a) => a.category === c.name).length,
  }));
}

/** null only when the slug is not a real category; an empty category returns articles: []. */
export async function getArticlesByCategorySlug(
  categorySlug: string,
): Promise<{ name: string; description: string; articles: Article[] } | null> {
  const category = categoryBySlug(categorySlug);
  if (!category) return null;
  const articles = (await getAllArticles()).filter((a) => a.category === category.name);
  return { name: category.name, description: category.description, articles };
}
