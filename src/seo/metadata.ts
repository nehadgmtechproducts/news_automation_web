import type { Metadata } from "next";
import type { Article } from "@/core/article";
import { siteConfig } from "@/config/site";

/**
 * Metadata builders. `metadataBase` (set once in the root layout) turns the relative
 * paths below into absolute canonical / Open Graph URLs.
 */
export function articleMetadata(article: Article): Metadata {
  const path = `/articles/${article.slug}`;
  const image = { url: article.heroImage.src, width: article.heroImage.width, height: article.heroImage.height, alt: article.heroImage.alt };
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: article.title,
      description: article.metaDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      tags: article.keywords,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [image.url],
    },
  };
}

export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: { type: "website", url: opts.path, title: opts.title, description: opts.description, siteName: siteConfig.name },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
