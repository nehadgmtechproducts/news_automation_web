import { distinctSourceCount, type Article } from "@/core/article";
import { cn } from "@/lib/cn";
import { CheckCircleIcon } from "@/components/ui/icons";

/** Computed from the real source list — never a hard-coded claim. `tone="dark"` is for use over photos. */
export function VerifiedBadge({
  article,
  tone = "light",
  dense = false,
}: {
  article: Pick<Article, "sources">;
  tone?: "light" | "dark";
  /** Smaller type for narrow cards, so "3 sources verified" stays on one line. */
  dense?: boolean;
}) {
  const n = distinctSourceCount(article);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        dense ? "text-micro" : "text-caption",
        tone === "light" ? "text-success" : "text-success-on-dark",
      )}
    >
      <CheckCircleIcon className={dense ? "size-3.5" : "size-4"} />
      <span className={tone === "light" ? "text-ink-muted" : "text-ink-inverse"}>
        {n} {n === 1 ? "source" : "sources"} verified
      </span>
    </span>
  );
}
