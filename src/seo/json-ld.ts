import type { Article } from "@/core/article";
import { toIsoDuration } from "@/core/format";
import { siteConfig } from "@/config/site";

/**
 * Structured-data builders. Pure functions: (data, origin) -> plain objects.
 * Origin is passed in (not imported) so these stay testable and framework-free.
 */
type Json = Record<string, unknown>;

const abs = (origin: string, path: string) => new URL(path, origin).toString();

export function organizationJsonLd(origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: siteConfig.name,
    url: origin,
    description: siteConfig.description,
    publishingPrinciples: abs(origin, "/about"),
  };
}

export function websiteJsonLd(origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: origin,
    inLanguage: siteConfig.language,
  };
}

export function newsArticleJsonLd(article: Article, origin: string): Json {
  const url = abs(origin, `/articles/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.metaDescription,
    image: [abs(origin, article.heroImage.src)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    keywords: article.keywords.join(", "),
    inLanguage: siteConfig.language,
    about: { "@type": "Thing", name: article.entity },
    // Honest attribution: the publisher, never an invented human byline.
    author: { "@type": "Organization", name: siteConfig.name, url: origin },
    publisher: { "@type": "Organization", name: siteConfig.name, url: origin },
    citation: article.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
      publisher: { "@type": "Organization", name: s.domain },
    })),
  };
}

export function videoObjectJsonLd(article: Article, origin: string): Json | null {
  if (!article.video) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: article.title,
    description: article.dek,
    thumbnailUrl: [abs(origin, article.video.poster)],
    uploadDate: article.publishedAt,
    duration: toIsoDuration(article.video.durationSeconds),
    contentUrl: abs(origin, article.video.src),
    embedUrl: abs(origin, `/articles/${article.slug}`),
    width: article.video.width,
    height: article.video.height,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[], origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(origin, c.path),
    })),
  };
}
