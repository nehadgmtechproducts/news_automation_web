import type { Article } from "./article";
import { storyPath } from "./stories";

/** One step of a breadcrumb trail. `path: null` = a label with no page of its own (shown, not linked). */
export type BreadcrumbItem = { name: string; path: string | null };

/**
 * Home › Stories › <story> › <article>. The story step links to its timeline page only when it has
 * one (2+ updates, see core/stories.ts); a one-update story has no page, so it is plain text.
 * The same trail feeds the visible breadcrumb and the search-engine breadcrumb (JSON-LD), so the
 * two can never disagree.
 */
export function articleBreadcrumbs(
  article: Pick<Article, "title" | "slug">,
  story: { key: string; label: string; updateCount: number },
): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: "Stories", path: "/stories" },
    { name: story.label, path: story.updateCount >= 2 ? storyPath(story.key) : null },
    { name: article.title, path: `/articles/${article.slug}` },
  ];
}

/** Only steps that have a URL can be listed to search engines. */
export function linkableCrumbs(items: BreadcrumbItem[]): { name: string; path: string }[] {
  return items.filter((i): i is { name: string; path: string } => i.path !== null);
}
