import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Article } from "@/core/article";
import { ArticleListItem } from "./ArticleListItem";

/**
 * "Most read today": the stories readers actually opened in the last 24 hours (core/reads.ts).
 * With no reads yet it says so, rather than listing unread stories under a title that claims otherwise.
 */
export function MostRead({ articles }: { articles: Article[] }) {
  return (
    <Panel>
      <SectionHeading title="Most read today" href="/most-read" />
      {articles.length === 0 ? (
        <p className="mt-4 text-small text-ink-muted">
          No reads yet today. Stories appear here as readers open them.
        </p>
      ) : (
        <ol className="mt-4 space-y-4">
          {articles.map((article, i) => (
            <li key={article.id} className="flex items-start gap-3">
              <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-small font-semibold text-brand">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <ArticleListItem article={article} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
