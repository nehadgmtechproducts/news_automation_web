import type { MetadataRoute } from "next";
import { absoluteUrl, showVideos } from "@/config/env";
import { REGIONS, hasOwnStories } from "@/core/regions";
import { groupStories } from "@/core/stories";
import { getAllArticles, getCategories } from "@/server/articles";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([getAllArticles(), getCategories()]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1, lastModified: articles[0]?.updatedAt },
    { url: absoluteUrl("/stories"), changeFrequency: "hourly", priority: 0.7 },
    { url: absoluteUrl("/latest"), changeFrequency: "hourly", priority: 0.8 },
    ...(showVideos ? [{ url: absoluteUrl("/watch"), changeFrequency: "daily" as const, priority: 0.6 }] : []),
    // Story timelines exist only for stories that have developed (2+ updates).
    ...groupStories(articles).filter((st) => st.updates.length >= 2).map((st) => ({
      url: absoluteUrl(`/stories/${st.key}`),
      lastModified: st.lastUpdatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/standards"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/legal-compliance"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/cookies"), changeFrequency: "yearly", priority: 0.2 },
    ...categories.filter((c) => c.count > 0).map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    // Editions with stories of their own (the others just repeat the Global page).
    ...REGIONS.filter((r) => r.name !== "Global" && hasOwnStories(articles, r.name)).map((r) => ({
      url: absoluteUrl(`/edition/${r.slug}`),
      changeFrequency: "hourly" as const,
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
