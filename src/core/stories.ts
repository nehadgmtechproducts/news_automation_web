import { distinctSourceCount, type Article } from "./article";
import { CATEGORIES, type CategoryName } from "./categories";
import type { RegionName } from "./regions";

/** An ongoing story: all the articles ("updates") sharing one story key, newest first. */
export type Story = {
  key: string;
  label: string;
  category: CategoryName;
  region: RegionName;
  /** The most recent update — its cover and category represent the story. */
  lead: Article;
  updates: Article[];
  lastUpdatedAt: string;
  /** Distinct publishers across ALL updates. */
  sourceCount: number;
};

export const storyPath = (key: string) => `/stories/${key}`;

/**
 * Group articles into stories. A story's label is the NEWEST update's (the engine keeps it stable
 * across a story, so this only matters if it is ever refined). Stories are ordered by their most
 * recent update, newest first; updates inside a story likewise.
 */
export function groupStories(articles: Article[]): Story[] {
  const byKey = new Map<string, Article[]>();
  for (const a of articles) byKey.set(a.story.key, [...(byKey.get(a.story.key) ?? []), a]);

  return [...byKey.entries()]
    .map(([key, group]) => {
      const updates = [...group].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const lead = updates[0];
      return {
        key,
        label: lead.story.label,
        category: lead.category,
        region: lead.region,
        lead,
        updates,
        lastUpdatedAt: lead.publishedAt,
        sourceCount: distinctSourceCount({ sources: updates.flatMap((u) => u.sources) }),
      };
    })
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt));
}

/** One tab of the "Developing stories" panel. */
export type StoryTab = { id: "all" | CategoryName; label: string; count: number };

/**
 * Tabs for the panel: "All stories" first, then EVERY category in the taxonomy's order, whether or
 * not it has a story yet (a count of 0 is honest, and keeps the filter the same on every visit).
 * Counts are stories, not articles.
 */
export function storyTabs(stories: Pick<StorySummary, "category">[]): StoryTab[] {
  return [
    { id: "all", label: "All stories", count: stories.length },
    ...CATEGORIES.map((c) => ({
      id: c.name as CategoryName,
      label: c.name as string,
      count: stories.filter((s) => s.category === c.name).length,
    })),
  ];
}

/** Timeline day groups. Days are UTC dates (YYYY-MM-DD) so the server and the browser agree. */
export function groupUpdatesByDay<T extends { publishedAt: string }>(updates: T[]): { day: string; items: T[] }[] {
  const groups: { day: string; items: T[] }[] = [];
  for (const u of updates) {
    const day = u.publishedAt.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(u);
    else groups.push({ day, items: [u] });
  }
  return groups;
}

/** A story is "live" while its newest update is recent. Pure: `nowMs` is passed in. */
export const LIVE_WINDOW_HOURS = 24;
export function isLive(story: { lastUpdatedAt: string; updates: readonly unknown[] }, nowMs: number): boolean {
  return story.updates.length >= 2 && nowMs - new Date(story.lastUpdatedAt).getTime() <= LIVE_WINDOW_HOURS * 3_600_000;
}

/** One row of a timeline. Small and serialisable: this is what crosses into client components. */
export type TimelineItem = {
  slug: string;
  title: string;
  publishedAt: string;
  sourceCount: number;
  category: CategoryName;
  region: RegionName;
};

export function toTimelineItem(a: Article): TimelineItem {
  return { slug: a.slug, title: a.title, publishedAt: a.publishedAt, sourceCount: distinctSourceCount(a), category: a.category, region: a.region };
}

/**
 * The slim shape handed to the interactive panel. Whole articles (with their full text) must not be
 * sent to the browser just to draw a list, so only what the panel shows is included.
 */
export type StorySummary = {
  key: string;
  label: string;
  category: CategoryName;
  coverSrc: string;
  updateCount: number;
  sourceCount: number;
  lastUpdatedAt: string;
  /** Where "View full timeline" goes: the story page, or the article itself if nothing followed it. */
  href: string;
  /** The newest few updates (the story page has them all). */
  updates: TimelineItem[];
};

export function toStorySummary(story: Story, maxUpdates = 5): StorySummary {
  return {
    key: story.key,
    label: story.label,
    category: story.category,
    coverSrc: story.lead.heroImage.src,
    updateCount: story.updates.length,
    sourceCount: story.sourceCount,
    lastUpdatedAt: story.lastUpdatedAt,
    href: story.updates.length >= 2 ? storyPath(story.key) : `/articles/${story.lead.slug}`,
    updates: story.updates.slice(0, maxUpdates).map(toTimelineItem),
  };
}
