import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema, type Article } from "@/core/article";
import { featuredFor, groupStories, toFeatured, toStorySummary } from "@/core/stories";

const dir = path.join(process.cwd(), "content", "articles");
const real: Article[] = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => articleSchema.parse(JSON.parse(readFileSync(path.join(dir, f), "utf8"))));

// Two stories; the second has two updates, so its LEAD is its newest article.
const base = real[0];
const mk = (slug: string, story: string, at: string, title: string): Article => ({ ...base, id: slug, slug, title, publishedAt: at, updatedAt: at, story: { key: story, label: `Story ${story}` } });
const articles = [
  mk("a-new", "a", "2026-10-20T10:00:00Z", "Story A headline"),
  mk("b-old", "b", "2026-10-18T10:00:00Z", "Story B first report"),
  mk("b-new", "b", "2026-10-19T10:00:00Z", "Story B latest report"),
];
const stories = groupStories(articles).map((s) => toStorySummary(s));
const lead = toFeatured(articles[0]);

describe("the lead card follows the story selected in Developing stories", () => {
  it("each story carries the card for its newest update (not its first)", () => {
    expect(stories.find((s) => s.key === "b")!.featured.slug).toBe("b-new");
    expect(stories.find((s) => s.key === "a")!.featured.slug).toBe("a-new");
  });

  it("selecting a story shows ITS cover, headline, summary and link target", () => {
    const f = featuredFor(stories, "b", lead);
    expect(f.title).toBe("Story B latest report");
    expect(f.slug).toBe("b-new");                       // "Read full story" goes to /articles/b-new
    expect(f.coverSrc).toBe(base.heroImage.src);
    expect(f.dek).toBe(base.dek);
  });

  it("selecting nothing (all closed), or an unknown key, falls back to the day's lead", () => {
    expect(featuredFor(stories, null, lead)).toBe(lead);
    expect(featuredFor(stories, "no-such-story", lead)).toBe(lead);
  });

  it("carries plain data only: no article body is sent to the browser", () => {
    const f = featuredFor(stories, "a", lead) as Record<string, unknown>;
    expect(Object.keys(f).sort()).toEqual(["category", "coverSrc", "dek", "publishedAt", "readMinutes", "slug", "sourceCount", "title"]);
    expect(f.readMinutes).toBeGreaterThanOrEqual(1);
    expect(f.sourceCount).toBeGreaterThanOrEqual(2);
  });
});
