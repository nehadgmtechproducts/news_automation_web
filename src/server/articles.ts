import "server-only";
import { cache } from "react";
import type { Article } from "@/core/article";
import { slugify } from "@/core/slug";
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

export type CategorySummary = { name: string; slug: string; count: number };

export async function getCategories(): Promise<CategorySummary[]> {
  const counts = new Map<string, number>();
  for (const a of await getAllArticles()) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, slug: slugify(name), count }));
}

export async function getArticlesByCategorySlug(
  categorySlug: string,
): Promise<{ name: string; articles: Article[] } | null> {
  const articles = (await getAllArticles()).filter((a) => slugify(a.category) === categorySlug);
  return articles.length ? { name: articles[0].category, articles } : null;
}
