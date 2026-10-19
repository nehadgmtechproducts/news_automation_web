import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { ArrowRightIcon } from "@/components/ui/icons";
import { storyPath, type Story, toTimelineItem } from "@/core/stories";
import { StoryTimeline } from "./StoryTimeline";

/** How many updates the side panel lists; the story page has them all. */
const MAX_SHOWN = 6;

/**
 * "Story timeline" on the article page: this story's updates with the one being read highlighted.
 * A story nothing has followed up yet has a one-point timeline, which says nothing, so it shows an
 * honest note instead and no "full timeline" links (that page only exists from 2 updates).
 */
export function StoryTimelinePanel({ story, currentSlug }: { story: Story; currentSlug: string }) {
  const developed = story.updates.length >= 2;
  const items = story.updates.slice(0, MAX_SHOWN).map(toTimelineItem);

  return (
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-heading text-ink">Story timeline</h2>
        {developed && (
          <Link href={storyPath(story.key)} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-small font-semibold text-brand hover:text-brand-strong">
            See full timeline <ArrowRightIcon />
          </Link>
        )}
      </div>

      <div className="mt-4">
        <StoryTimeline items={items} currentSlug={currentSlug} chips />
      </div>

      {developed ? (
        <Link
          href={storyPath(story.key)}
          className="mt-5 flex items-center justify-center gap-1 rounded-control bg-brand-soft py-2.5 text-small font-semibold text-brand hover:text-brand-strong"
        >
          View all {story.updates.length} updates <ArrowRightIcon />
        </Link>
      ) : (
        <p className="mt-4 text-small text-ink-muted">No later updates yet. Follow-up reports on this story will appear here.</p>
      )}
    </Panel>
  );
}
