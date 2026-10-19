import type { Article } from "./article";
import { plainText } from "./markdown";

/** Lower-case words of a query; punctuation ignored, 1-letter noise dropped. */
export function tokenize(query: string): string[] {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

/** Weighted match score for one token: where it appears decides how much it counts. */
function tokenScore(article: Article, token: string): number {
  const has = (text: string) => text.toLowerCase().includes(token);
  let score = 0;
  if (has(article.title)) score += 5;
  if (has(article.entity)) score += 4;
  if (article.keywords.some(has)) score += 3;
  if (has(article.dek)) score += 2;
  if (has(article.category)) score += 1;
  if (article.sections.some((s) => has(s.heading) || has(plainText(s.body)))) score += 1;
  return score;
}

/**
 * Every query word must appear somewhere in the article (AND search); results are ordered by
 * relevance, then newest first. An empty or one-letter query matches nothing, by design.
 */
export function searchArticles(articles: Article[], query: string): Article[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return articles
    .map((article) => {
      const scores = tokens.map((t) => tokenScore(article, t));
      return { article, score: scores.every((s) => s > 0) ? scores.reduce((a, b) => a + b, 0) : 0 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.article.publishedAt.localeCompare(a.article.publishedAt))
    .map((r) => r.article);
}
