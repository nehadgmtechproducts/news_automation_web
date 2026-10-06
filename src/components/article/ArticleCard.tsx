import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/core/article";
import { formatDate, formatDuration, readingMinutes } from "@/core/format";
import { VerifiedBadge } from "./VerifiedBadge";

type Props = { article: Article; priority?: boolean; featured?: boolean };

export function ArticleCard({ article, priority = false, featured = false }: Props) {
  const href = `/articles/${article.slug}`;
  return (
    <article className={featured ? "grid gap-6 md:grid-cols-2 md:items-center" : "flex flex-col gap-3"}>
      <Link href={href} className="relative block overflow-hidden rounded-lg bg-line" tabIndex={-1} aria-hidden>
        <Image
          src={article.heroImage.src}
          alt=""
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          priority={priority}
          className="aspect-video w-full object-cover"
        />
        {article.video && (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
            ▶ {formatDuration(article.video.durationSeconds)}
          </span>
        )}
      </Link>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{article.category}</p>
        <h2 className={`font-serif font-semibold leading-tight ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}>
          <Link href={href} className="hover:underline">{article.title}</Link>
        </h2>
        <p className="text-muted">{article.dek}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <VerifiedBadge article={article} />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span>{readingMinutes(article)} min read</span>
        </div>
      </div>
    </article>
  );
}
