import type { Article } from "./article";
import { slugify } from "./slug";

export type OutlineItem = { id: string; label: string };

/**
 * The "On this article" list. The article page uses the SAME ids for its headings, so the
 * outline links and the headings can never drift apart. Duplicate headings get -2, -3 …
 */
export function buildOutline(article: Pick<Article, "sections" | "keyTakeaways">): OutlineItem[] {
  const used = new Set<string>(["key-takeaways", "why-it-matters", "sources"]);
  const items: OutlineItem[] = [];
  if (article.keyTakeaways.length) items.push({ id: "key-takeaways", label: "Key takeaways" });

  for (const section of article.sections) {
    const base = slugify(section.heading) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    items.push({ id, label: section.heading });
  }

  items.push({ id: "why-it-matters", label: "Why it matters" });
  items.push({ id: "sources", label: "Sources" });
  return items;
}
