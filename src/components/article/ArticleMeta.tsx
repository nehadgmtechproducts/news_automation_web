import { TimeAgo } from "@/components/client/TimeAgo";
import { ClockIcon } from "@/components/ui/icons";
import type { Article } from "@/core/article";
import { formatDate, readingMinutes } from "@/core/format";
import { cn } from "@/lib/cn";
import { VerifiedBadge } from "./VerifiedBadge";

/** "✓ 3 sources verified · 🕒 10 min ago · 4 min read" — the metadata row used on every card. */
export function ArticleMeta({
  article,
  tone = "light",
  showReadTime = false,
  showTime = true,
  stacked = false,
  className,
}: {
  article: Article;
  tone?: "light" | "dark";
  showReadTime?: boolean;
  /** Hide the "10 min ago" / date item (the article page already shows the date above the title). */
  showTime?: boolean;
  /** One item per line, for narrow cards (instead of wrapping side by side). */
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex",
        stacked ? "text-micro" : "text-caption",
        stacked ? "flex-col items-start gap-1" : "flex-wrap items-center gap-x-3 gap-y-1",
        tone === "light" ? "text-ink-subtle" : "text-ink-inverse/85",
        className,
      )}
    >
      <VerifiedBadge article={article} tone={tone} dense={stacked} />
      {showTime && (
        <span className="inline-flex items-center gap-1">
          <ClockIcon className={stacked ? "size-3" : "size-3.5"} />
          <TimeAgo iso={article.publishedAt} fallback={formatDate(article.publishedAt)} />
        </span>
      )}
      {showReadTime && <span>{readingMinutes(article)} min read</span>}
    </div>
  );
}
