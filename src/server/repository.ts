import type { Article } from "@/core/article";

/**
 * The seam between "where articles live" and "what the site does with them".
 * Today: JSON files written by the pipeline. Tomorrow: a database or CMS API —
 * implement this interface, change one line in `articles.ts`, no page changes.
 */
export interface ArticleRepository {
  /** All articles, newest first. */
  list(): Promise<Article[]>;
  bySlug(slug: string): Promise<Article | null>;
}
