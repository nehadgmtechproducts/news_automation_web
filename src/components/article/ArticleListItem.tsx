import Image from "next/image";
import Link from "next/link";
import { TimeAgo } from "@/components/client/TimeAgo";
import { AiBadge } from "@/components/ui/AiBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { isAiGenerated, type Article } from "@/core/article";
import { formatDate } from "@/core/format";

/** Compact row: small thumbnail + category + title + time. Used in sidebars and rankings. */
export function ArticleListItem({ article, showCategory = true }: { article: Article; showCategory?: boolean }) {
  return (
    <article className="group relative flex items-start gap-3">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
        <Image src={article.heroImage.src} alt="" fill sizes="96px" className="object-cover" />
        {isAiGenerated(article.heroImage) && <AiBadge size="mini" />}
      </div>
      <div className="min-w-0">
        {showCategory && <CategoryTag category={article.category} />}
        <h3 className={showCategory ? "mt-0.5 line-clamp-2 text-small font-semibold text-ink" : "line-clamp-2 text-small font-semibold text-ink"}>
          <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
            {article.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-caption text-ink-subtle">
          <TimeAgo iso={article.publishedAt} fallback={formatDate(article.publishedAt)} />
        </p>
      </div>
    </article>
  );
}
