import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/env";
import { getAllArticles, getCategories } from "@/server/articles";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([getAllArticles(), getCategories()]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1, lastModified: articles[0]?.updatedAt },
    { url: absoluteUrl("/watch"), changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    ...categories.filter((c) => c.count > 0).map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [absoluteUrl(a.heroImage.src)],
      ...(a.video && {
        videos: [
          {
            title: a.title,
            thumbnail_loc: absoluteUrl(a.video.poster),
            description: a.dek,
            content_loc: absoluteUrl(a.video.src),
            duration: Math.round(a.video.durationSeconds),
            publication_date: a.publishedAt,
          },
        ],
      }),
    })),
  ];
}
