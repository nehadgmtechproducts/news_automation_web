import { distinctSourceCount, type Article } from "@/core/article";

/** Computed from the real source list — never a hard-coded claim. */
export function VerifiedBadge({ article }: { article: Pick<Article, "sources"> }) {
  const n = distinctSourceCount(article);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-verified-bg px-2.5 py-0.5 text-xs font-semibold text-verified">
      <span aria-hidden>✓</span>
      {n} {n === 1 ? "source" : "sources"} verified
    </span>
  );
}
