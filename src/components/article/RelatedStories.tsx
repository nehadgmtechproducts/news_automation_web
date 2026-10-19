import { Panel } from "@/components/ui/Panel";
import type { Article } from "@/core/article";
import { ArticleListItem } from "./ArticleListItem";

export function RelatedStories({ articles, title = "Related articles" }: { articles: Article[]; title?: string }) {
  if (articles.length === 0) return null;
  return (
    <Panel>
      <h2 className="font-serif text-heading text-ink">{title}</h2>
      <div className="mt-4 space-y-4">
        {articles.map((a) => (
          <ArticleListItem key={a.id} article={a} showCategory={false} />
        ))}
      </div>
    </Panel>
  );
}
