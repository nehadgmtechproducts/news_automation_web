import { z } from "zod";
import { CATEGORY_NAMES } from "./categories";
import { REGION_NAMES } from "./regions";

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
  /** Shown under the picture when set: "Illustration generated with AI", or "Image: The Guardian" for a source photo. */
  credit: z.string().min(1).optional(),
  /** For a source photo: the page the picture came from. The credit links there. */
  creditUrl: z.url().optional(),
  /** The picture is an AI-generated illustration (it then carries the AI badge). */
  aiGenerated: z.boolean().optional(),
});

/**
 * True for a picture that is an AI-generated illustration. The exporter writes `aiGenerated` for those. Stories
 * exported before that field existed carry only the credit "Illustration generated with AI", so that still counts.
 * A source photo ("Image: The Guardian") is NOT AI-generated, and must not wear the AI badge.
 */
export const isAiGenerated = (image: { credit?: string; aiGenerated?: boolean }): boolean =>
  image.aiGenerated ?? Boolean(image.credit?.toLowerCase().startsWith("illustration generated with ai"));

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
  /** One of the fixed taxonomy (see categories.ts) — never free text. */
  category: z.enum(CATEGORY_NAMES),
  /**
   * The ongoing story this article is one UPDATE of. Follow-up reports share a `key`; the website
   * groups on it to build the "Developing stories" panel and the story timeline. A standalone
   * article is simply a story with one update.
   */
  story: z.object({ key: z.string().min(1), label: z.string().min(1) }),
  /** The edition it belongs to (see regions.ts): "Global" unless it is about one region. */
  region: z.enum(REGION_NAMES),
  /** The main company/product/person the story is about. */
  entity: z.string().min(1),
  publishedAt: isoDateTime,
  updatedAt: isoDateTime,
  /** Text-free cover used in the UI (the headline is drawn by the page, not baked into the image). */
  heroImage: imageSchema,
  /** Optional titled card for link previews (Open Graph / Twitter). Falls back to heroImage. */
  socialImage: imageSchema.optional(),
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

/**
 * The article as the site should show it with videos switched off: identical, minus `video`.
 * Done once, where articles are loaded, so no page, card, sitemap entry or structured-data block
 * can show a video by accident. The video data stays in the content files for when it returns.
 */
export function withoutVideo(article: Article): Article {
  const copy: Article = { ...article };
  delete copy.video;
  return copy;
}
