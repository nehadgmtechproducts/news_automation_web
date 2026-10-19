import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema, type Article } from "@/core/article";
import { formatTimeUtc } from "@/core/format";
import { LIVE_WINDOW_HOURS, groupStories, storyTabs, groupUpdatesByDay, isLive, storyPath, toStorySummary, toTimelineItem } from "@/core/stories";

const dir = path.join(process.cwd(), "content", "articles");
const base: Article = articleSchema.parse(JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8")));

/** Synthetic articles, used only inside tests. */
const mk = (id: string, story: string, at: string, over: Partial<Article> = {}): Article => ({
  ...base, id, slug: id, publishedAt: at, updatedAt: at, story: { key: story, label: `${story} label` }, ...over,
});
const src = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => ({ ...base.sources[0], index: i + 1, domain: `${prefix}${i}.com` }));

describe("groupStories", () => {
  const all = [
    mk("a1", "voice", "2026-10-05T10:00:00Z"),
    mk("b1", "apple", "2026-10-06T09:00:00Z"),
    mk("a2", "voice", "2026-10-07T08:00:00Z"),
    mk("a3", "voice", "2026-10-06T20:00:00Z"),
  ];

  it("groups updates under their story key, newest update first", () => {
    const voice = groupStories(all).find((s) => s.key === "voice")!;
    expect(voice.updates.map((u) => u.id)).toEqual(["a2", "a3", "a1"]);
    expect(voice.lead.id).toBe("a2");
    expect(voice.lastUpdatedAt).toBe("2026-10-07T08:00:00Z");
  });

  it("orders stories by their most recent update", () => {
    expect(groupStories(all).map((s) => s.key)).toEqual(["voice", "apple"]);
  });

  it("a standalone article is a story with one update", () => {
    const apple = groupStories(all).find((s) => s.key === "apple")!;
    expect(apple.updates).toHaveLength(1);
  });

  it("counts distinct publishers across ALL updates, not per article", () => {
    const stories = groupStories([
      mk("x1", "s", "2026-10-05T00:00:00Z", { sources: src(2, "a") }),
      mk("x2", "s", "2026-10-06T00:00:00Z", { sources: [...src(2, "a"), ...src(1, "b")] }),
    ]);
    expect(stories[0].sourceCount).toBe(3);       // a0, a1, b0 — a0/a1 are shared, counted once
  });

  it("takes category and region from the newest update", () => {
    const s = groupStories([
      mk("o", "s", "2026-10-05T00:00:00Z", { category: "Technology", region: "Global" }),
      mk("n", "s", "2026-10-06T00:00:00Z", { category: "Politics", region: "Europe" }),
    ])[0];
    expect([s.category, s.region]).toEqual(["Politics", "Europe"]);
  });

  it("handles no articles", () => {
    expect(groupStories([])).toEqual([]);
  });
});

describe("storyTabs", () => {
  const withCategories = (...cats: Article["category"][]) => cats.map((category) => ({ category }));

  it("always lists every category, in taxonomy order, after 'All stories'", () => {
    expect(storyTabs([]).map((t) => t.label)).toEqual(["All stories", "Technology", "Politics", "Finance", "Entertainment", "Launches"]);
  });

  it("counts stories per category, including zero for categories with none", () => {
    const tabs = storyTabs(withCategories("Technology", "Technology", "Finance"));
    expect(Object.fromEntries(tabs.map((t) => [t.label, t.count]))).toEqual({
      "All stories": 3, Technology: 2, Politics: 0, Finance: 1, Entertainment: 0, Launches: 0,
    });
  });

  it("'All stories' is the total, which is the sum of the category counts", () => {
    const tabs = storyTabs(withCategories("Politics", "Launches", "Launches", "Technology"));
    expect(tabs[0].count).toBe(tabs.slice(1).reduce((n, t) => n + t.count, 0));
  });

  it("has ids that match the category names (so filtering by tab id works)", () => {
    expect(storyTabs([]).map((t) => t.id)).toEqual(["all", "Technology", "Politics", "Finance", "Entertainment", "Launches"]);
  });
});

describe("groupUpdatesByDay", () => {
  it("groups consecutive updates by UTC date, keeping order", () => {
    const g = groupUpdatesByDay([
      mk("1", "s", "2026-10-07T10:30:00Z"), mk("2", "s", "2026-10-07T08:45:00Z"), mk("3", "s", "2026-10-06T18:10:00Z"),
    ]);
    expect(g.map((x) => [x.day, x.items.map((i) => i.id)])).toEqual([["2026-10-07", ["1", "2"]], ["2026-10-06", ["3"]]]);
  });
});

describe("isLive", () => {
  const now = Date.parse("2026-10-07T12:00:00Z");
  const story = (updates: number, lastIso: string) => ({ lastUpdatedAt: lastIso, updates: Array(updates).fill(base) });

  it("is live only with 2+ updates and a recent one", () => {
    expect(isLive(story(3, "2026-10-07T10:00:00Z"), now)).toBe(true);
    expect(isLive(story(1, "2026-10-07T10:00:00Z"), now)).toBe(false);   // nothing has developed yet
    expect(isLive(story(3, "2026-10-05T10:00:00Z"), now)).toBe(false);   // gone quiet
  });

  it("has a 24 hour window", () => {
    expect(LIVE_WINDOW_HOURS).toBe(24);
    expect(isLive(story(2, new Date(now - 24 * 3_600_000).toISOString()), now)).toBe(true);
    expect(isLive(story(2, new Date(now - 24 * 3_600_000 - 1000).toISOString()), now)).toBe(false);
  });
});

describe("storyPath", () => {
  it("is /stories/<key>", () => {
    expect(storyPath("voice")).toBe("/stories/voice");
  });
});

describe("summaries (what crosses into the browser)", () => {
  it("contain no article text, only what the panel draws", () => {
    const story = groupStories([mk("a1", "s", "2026-10-05T00:00:00Z"), mk("a2", "s", "2026-10-06T00:00:00Z")])[0];
    const json = JSON.stringify(toStorySummary(story));
    expect(json).not.toContain(base.sections[0].body.slice(0, 40));   // no article body
    expect(json).not.toContain(base.whyItMatters.slice(0, 40));
  });

  it("link to the timeline only once a story has developed, else straight to the article", () => {
    const [one] = groupStories([mk("solo", "x", "2026-10-05T00:00:00Z")]);
    const [two] = groupStories([mk("a1", "y", "2026-10-05T00:00:00Z"), mk("a2", "y", "2026-10-06T00:00:00Z")]);
    expect(toStorySummary(one).href).toBe("/articles/solo");
    expect(toStorySummary(two).href).toBe("/stories/y");
  });

  it("keeps only the newest few updates, newest first", () => {
    const arts = Array.from({ length: 8 }, (_, i) => mk(`u${i}`, "s", `2026-10-0${i + 1}T00:00:00Z`));
    const sum = toStorySummary(groupStories(arts)[0], 5);
    expect(sum.updateCount).toBe(8);
    expect(sum.updates.map((u) => u.slug)).toEqual(["u7", "u6", "u5", "u4", "u3"]);
  });

  it("timeline items carry the distinct source count", () => {
    expect(toTimelineItem(mk("a", "s", "2026-10-05T00:00:00Z", { sources: src(3, "z") })).sourceCount).toBe(3);
  });
});

describe("formatTimeUtc", () => {
  it("prints the UTC clock time", () => {
    expect(formatTimeUtc("2026-10-07T09:05:00Z")).toBe("09:05 UTC");
    expect(formatTimeUtc("2026-10-07T23:59:59Z")).toBe("23:59 UTC");
  });
});

import { scrollEdges } from "@/core/scroll";

describe("scrollEdges (which tab-row arrows to show)", () => {
  it("shows only the right arrow at the start of an overflowing row", () => {
    expect(scrollEdges(0, 300, 600)).toEqual({ left: false, right: true });
  });

  it("shows both arrows in the middle", () => {
    expect(scrollEdges(150, 300, 600)).toEqual({ left: true, right: true });
  });

  it("shows only the left arrow at the end", () => {
    expect(scrollEdges(300, 300, 600)).toEqual({ left: true, right: false });
  });

  it("shows neither when everything fits", () => {
    expect(scrollEdges(0, 400, 400)).toEqual({ left: false, right: false });
  });

  it("tolerates sub-pixel rounding at both ends (no arrow stuck on)", () => {
    expect(scrollEdges(0.4, 300, 600).left).toBe(false);
    expect(scrollEdges(299.6, 300, 600).right).toBe(false);
  });
});
