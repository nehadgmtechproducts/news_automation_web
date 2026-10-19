import Image from "next/image";
import Link from "next/link";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { cn } from "@/lib/cn";
import type { Article } from "@/core/article";
import { formatDuration } from "@/core/format";
import { ArticleMeta } from "./ArticleMeta";

/**
 * Grid card. The title link is "stretched" over the whole card (after:absolute), so the card is
 * one big click target but still a single, properly labelled link for screen readers.
 */
export function ArticleCard({
  article,
  priority = false,
  compact = false,
  as: Heading = "h3",
}: {
  article: Article;
  priority?: boolean;
  /** The narrow card of the 5-across Latest news row: same 16:9 thumbnail as the Watch cards, small sans title, stacked meta. */
  compact?: boolean;
  as?: "h2" | "h3";
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-video bg-surface-sunken">
        <Image
          src={article.heroImage.src}
          alt=""
          fill
          sizes={compact ? "(min-width: 1280px) 14vw, (min-width: 768px) 28vw, 45vw" : "(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"}
          priority={priority}
          className="object-cover"
        />
        {article.video && (
          <span className={cn("absolute rounded-control bg-navy/80 font-semibold text-ink-inverse", compact ? "bottom-1.5 right-1.5 px-1.5 py-0.5 text-label" : "bottom-2 right-2 px-2 py-0.5 text-caption")}>
            ▶ {formatDuration(article.video.durationSeconds)}
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", compact ? "gap-1.5 p-2.5" : "gap-2 p-4")}>
        <CategoryTag category={article.category} />
        <Heading className={cn("text-ink", compact ? "line-clamp-4 text-compact" : "font-serif text-heading")}>
          <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
            {article.title}
          </Link>
        </Heading>
        <ArticleMeta article={article} stacked={compact} className="mt-auto pt-1" />
      </div>
    </article>
  );
}
