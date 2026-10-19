import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StoryTimelinePanel } from "@/components/story/StoryTimelinePanel";
import { articleSchema, type Article } from "@/core/article";
import { articleBreadcrumbs, linkableCrumbs } from "@/core/breadcrumbs";
import { groupStories } from "@/core/stories";

const dir = path.join(process.cwd(), "content", "articles");
const base: Article = articleSchema.parse(JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8")));
/** Synthetic articles, used only inside tests. */
const mk = (slug: string, story: string, at: string): Article => ({ ...base, id: slug, slug, title: `Title ${slug}`, publishedAt: at, updatedAt: at, story: { key: story, label: `Story ${story}` } });

describe("articleBreadcrumbs", () => {
  const article = { title: "The article", slug: "the-article" };

  it("is Home > Stories > story > article", () => {
    expect(articleBreadcrumbs(article, { key: "k", label: "My story", updateCount: 3 }).map((c) => c.name)).toEqual(["Home", "Stories", "My story", "The article"]);
  });

  it("links the story step to its timeline only when the story has one (2+ updates)", () => {
    expect(articleBreadcrumbs(article, { key: "k", label: "S", updateCount: 2 })[2].path).toBe("/stories/k");
    expect(articleBreadcrumbs(article, { key: "k", label: "S", updateCount: 1 })[2].path).toBeNull();
  });

  it("the search-engine trail skips steps with no page, and ends at the article", () => {
    const trail = linkableCrumbs(articleBreadcrumbs(article, { key: "k", label: "S", updateCount: 1 }));
    expect(trail.map((c) => c.path)).toEqual(["/", "/stories", "/articles/the-article"]);
  });
});

describe("StoryTimelinePanel", () => {
  const stories = groupStories([mk("a1", "s", "2026-10-05T10:00:00Z"), mk("a2", "s", "2026-10-06T08:00:00Z"), mk("a3", "s", "2026-10-07T09:30:00Z"), mk("solo", "x", "2026-10-07T00:00:00Z")]);
  const story = (key: string) => stories.find((s) => s.key === key)!;

  it("a developed story: lists its updates, highlights the one being read, and links to the full timeline", () => {
    const html = renderToStaticMarkup(<StoryTimelinePanel story={story("s")} currentSlug="a2" />);
    expect(html).toContain("Story timeline");
    for (const t of ["Title a1", "Title a2", "Title a3"]) expect(html).toContain(t);
    expect(html).toContain("View all 3 updates");
    expect(html).toContain('href="/stories/s"');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);                         // exactly one current update
    expect(html).toMatch(/aria-current="page">Title a2</);                                // ... and it is the right one
    expect(html).not.toMatch(/<a [^>]*>Title a2<\/a>/);                                  // the current update is not a link to itself
    expect(html).not.toContain("No later updates yet");
  });

  it("a story with ONE update: an honest note, and no link to a timeline page that doesn't exist", () => {
    const html = renderToStaticMarkup(<StoryTimelinePanel story={story("x")} currentSlug="solo" />);
    expect(html).toContain("No later updates yet");
    expect(html).not.toContain("See full timeline");
    expect(html).not.toContain("View all");
    expect(html).not.toContain("/stories/x");
  });

  it("shows category and region as pills", () => {
    const html = renderToStaticMarkup(<StoryTimelinePanel story={story("s")} currentSlug="a1" />);
    expect(html).toContain(`>${base.category}</span>`);
    expect(html).toContain(`>${base.region}</span>`);
  });

  it("caps the side panel at 6 updates but says how many there really are", () => {
    const many = groupStories(Array.from({ length: 9 }, (_, i) => mk(`m${i}`, "big", `2026-10-0${(i % 9) + 1}T00:00:00Z`)))[0];
    const html = renderToStaticMarkup(<StoryTimelinePanel story={many} currentSlug="m0" />);
    expect((html.match(/<time /g) ?? []).length).toBe(6);
    expect(html).toContain("View all 9 updates");
  });
});
