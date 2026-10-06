import { z } from "zod";

/**
 * The content contract between the news pipeline (producer) and this site (consumer).
 *
 * Everything that enters the site passes through `articleSchema`. If the producer ever
 * changes shape, validation fails here with a readable message rather than crashing a
 * page render halfway through. Bump `schemaVersion` for breaking changes.
 */

const isoDateTime = z.iso.datetime();
const isoDateOrDateTime = z.union([z.iso.datetime(), z.iso.date()]);
const publicPath = z.string().startsWith("/");

export const sourceSchema = z.object({
  index: z.number().int().positive(),
  title: z.string().min(1),
  domain: z.string().min(1),
  url: z.url(),
  publishedAt: isoDateOrDateTime.nullable().optional(),
});

export const imageSchema = z.object({
  src: publicPath,
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const videoSchema = z.object({
  src: publicPath,
  poster: publicPath,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationSeconds: z.number().positive(),
});

export const articleSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-hyphenated"),
  title: z.string().min(1).max(160),
  dek: z.string().min(1),
  /** Goes straight into <meta name="description">; search engines truncate near 160. */
  metaDescription: z.string().min(1).max(200),
  category: z.string().min(1),
  /** The main company/product/person the story is about. */
  entity: z.string().min(1),
  publishedAt: isoDateTime,
  updatedAt: isoDateTime,
  heroImage: imageSchema,
  video: videoSchema.optional(),
  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(1),
  keyTakeaways: z.array(z.string().min(1)),
  whyItMatters: z.string().min(1),
  /**
   * The editorial rule of the whole product: nothing is published from fewer than two
   * independent sources. Enforced here, at the boundary, not left to convention.
   */
  sources: z.array(sourceSchema).min(2),
  keywords: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
});

export type Source = z.infer<typeof sourceSchema>;
export type ArticleVideo = z.infer<typeof videoSchema>;
export type Article = z.infer<typeof articleSchema>;

/** Number of distinct publishers behind a story (two links to one outlet count once). */
export function distinctSourceCount(article: Pick<Article, "sources">): number {
  return new Set(article.sources.map((s) => s.domain.toLowerCase())).size;
}
