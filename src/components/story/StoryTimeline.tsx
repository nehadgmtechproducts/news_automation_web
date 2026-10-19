import Link from "next/link";
import { CheckCircleIcon } from "@/components/ui/icons";
import { formatDate, formatTimeUtc } from "@/core/format";
import { groupUpdatesByDay, type TimelineItem } from "@/core/stories";

/**
 * Updates grouped by day, newest first: a dot on a vertical line, the time, the headline, and
 * "✓ 3 sources · Technology · Global". Presentational only (no hooks, no data access), so the
 * interactive home panel and the story page share it.
 */
export function StoryTimeline({
  items,
  currentSlug,
  chips = false,
}: {
  items: TimelineItem[];
  /** The update being read: highlighted, with a larger dot. */
  currentSlug?: string;
  /** Category and region as small pills (the article page) instead of "· Technology · Global". */
  chips?: boolean;
}) {
  const days = groupUpdatesByDay(items);
  return (
    <div className="space-y-5">
      {days.map((group) => (
        <section key={group.day} aria-label={formatDate(`${group.day}T00:00:00Z`)}>
          <h4 className="mb-2 text-small font-semibold text-ink">{formatDate(`${group.day}T00:00:00Z`)}</h4>
          <ol className="relative space-y-4 border-l border-line pl-5">
            {group.items.map((u) => {
              const current = u.slug === currentSlug;
              return (
                <li key={u.slug} className="relative">
                  <span
                    className={
                      current
                        ? "absolute -left-[1.75rem] top-2 size-3.5 rounded-full border-[3px] border-brand-soft bg-brand"
                        : "absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-surface bg-brand"
                    }
                    aria-hidden
                  />
                  <div className={current ? "-my-1 rounded-control bg-brand-soft px-2 py-1" : undefined}>
                    <time dateTime={u.publishedAt} className="text-caption font-medium text-ink-subtle">
                      {formatTimeUtc(u.publishedAt)}
                    </time>
                    <p className="mt-0.5 text-small font-semibold text-ink">
                      {current ? (
                        <span aria-current="page">{u.title}</span>
                      ) : (
                        <Link href={`/articles/${u.slug}`} className="hover:text-brand">{u.title}</Link>
                      )}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-subtle">
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircleIcon className="size-3.5" />
                        <span className="text-ink-muted">{u.sourceCount} {u.sourceCount === 1 ? "source" : "sources"}</span>
                      </span>
                      {chips ? (
                        <>
                          <span className="rounded-full bg-canvas px-2 py-0.5 text-micro text-ink-muted">{u.category}</span>
                          <span className="rounded-full bg-canvas px-2 py-0.5 text-micro text-ink-muted">{u.region}</span>
                        </>
                      ) : (
                        <>
                          <span>· {u.category}</span>
                          <span>· {u.region}</span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
