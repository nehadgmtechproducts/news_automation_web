import Image from "next/image";
import Link from "next/link";
import { LiveBadge } from "@/components/client/LiveBadge";
import { TimeAgo } from "@/components/client/TimeAgo";
import { AiBadge } from "@/components/ui/AiBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { isAiGenerated } from "@/core/article";
import { formatDate } from "@/core/format";
import { storyPath, type Story } from "@/core/stories";

/** One story as a card row: cover, label, "8 updates · 5 sources · Last update 10 min ago". */
export function StoryRow({ story, priority = false }: { story: Story; priority?: boolean }) {
  const href = story.updates.length >= 2 ? storyPath(story.key) : `/articles/${story.lead.slug}`;
  return (
    <article className="group relative flex gap-4 rounded-card bg-surface p-4 shadow-card transition-shadow hover:shadow-lift">
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
        <Image src={story.lead.heroImage.src} alt="" fill sizes="144px" priority={priority} className="object-cover" />
        {isAiGenerated(story.lead.heroImage) && <AiBadge size="mini" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <LiveBadge story={story} />
          <CategoryTag category={story.category} />
        </div>
        <h2 className="mt-1 font-serif text-heading text-ink">
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-brand">{story.label}</Link>
        </h2>
        <p className="mt-1 line-clamp-2 text-small text-ink-muted">{story.lead.title}</p>
        <p className="mt-2 text-caption text-ink-subtle">
          {story.updates.length} {story.updates.length === 1 ? "update" : "updates"} · {story.sourceCount} sources · Last update{" "}
          <TimeAgo iso={story.lastUpdatedAt} fallback={formatDate(story.lastUpdatedAt)} />
        </p>
      </div>
    </article>
  );
}
