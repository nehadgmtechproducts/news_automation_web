import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { FeaturedStory } from "@/components/home/FeaturedStory";
import { StoryRow } from "@/components/story/StoryRow";
import { AiBadge } from "@/components/ui/AiBadge";
import { articleSchema, isAiGenerated, type Article } from "@/core/article";
import { groupStories, toFeatured, toStorySummary } from "@/core/stories";
import { newsArticleJsonLd } from "@/seo/json-ld";

const dir = path.join(process.cwd(), "content", "articles");
const base: Article = articleSchema.parse(JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8")));
const withCredit = (credit?: string): Article => ({ ...base, heroImage: { ...base.heroImage, ...(credit ? { credit } : { credit: undefined }) } });
const ai = withCredit("Illustration generated with AI");
const plain = withCredit();
const badges = (html: string) => (html.match(/data-ai-badge/g) ?? []).length;

describe("AiBadge", () => {
  it("has three sizes with their own wording, and spells it out in the title", () => {
    const full = renderToStaticMarkup(<AiBadge size="full" />);
    expect(full).toContain("AI-generated");
    expect(full).toContain('<span class="hidden sm:inline"> illustration</span>');   // the long wording only where there is room
    expect(renderToStaticMarkup(<AiBadge size="short" />)).toContain(">AI-generated<");
    const mini = renderToStaticMarkup(<AiBadge size="mini" />);
    expect(mini).toContain(">AI<");
    expect(mini).toContain('title="Illustration generated with AI"');
  });

  it("never blocks a click on the card it sits on", () => {
    expect(renderToStaticMarkup(<AiBadge />)).toContain("pointer-events-none");
  });
});

describe("isAiGenerated", () => {
  it("is true only for a picture with a credit (the exporter credits AI covers and nothing else)", () => {
    expect(isAiGenerated(ai.heroImage)).toBe(true);
    expect(isAiGenerated(plain.heroImage)).toBe(false);
  });
});

describe("the badge appears on AI pictures and only on them", () => {
  it("article cards (normal and compact)", () => {
    expect(badges(renderToStaticMarkup(<ArticleCard article={ai} />))).toBe(1);
    expect(renderToStaticMarkup(<ArticleCard article={ai} compact />)).toContain(">AI<");
    expect(badges(renderToStaticMarkup(<ArticleCard article={plain} />))).toBe(0);
  });

  it("list rows", () => {
    expect(badges(renderToStaticMarkup(<ArticleListItem article={ai} />))).toBe(1);
    expect(badges(renderToStaticMarkup(<ArticleListItem article={plain} />))).toBe(0);
  });

  it("the lead story card follows the story's picture", () => {
    expect(badges(renderToStaticMarkup(<FeaturedStory featured={toFeatured(ai)} />))).toBe(1);
    expect(badges(renderToStaticMarkup(<FeaturedStory featured={toFeatured(plain)} />))).toBe(0);
  });

  it("story rows and the developing-stories summary carry the flag", () => {
    const story = groupStories([ai])[0];
    expect(badges(renderToStaticMarkup(<StoryRow story={story} />))).toBe(1);
    expect(toStorySummary(story).coverAi).toBe(true);
    expect(toStorySummary(groupStories([plain])[0]).coverAi).toBe(false);
  });
});

describe("no picture can skip the check", () => {
  /** Every file that draws a story's cover must also mention the badge. A new component that forgets it fails here. */
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
  const drawsCovers = walk("src").filter((f) => /\.tsx$/.test(f) && /heroImage\.src|coverSrc/.test(readFileSync(f, "utf8")));

  it("finds the components that draw covers", () => {
    expect(drawsCovers.length).toBeGreaterThanOrEqual(8);
  });

  it.each(drawsCovers.map((f) => [f]))("%s uses the AI badge", (file) => {
    expect(readFileSync(file, "utf8")).toContain("AiBadge");
  });
});

describe("structured data and link previews", () => {
  const withShare: Article = { ...ai, socialImage: { src: "/media/x/social-1.jpg", alt: "a", width: 1200, height: 675 } };
  const images = (a: Article) => (newsArticleJsonLd(a, "https://example.com") as { image: string[] }).image;

  it("offers search engines only the labelled share image when the cover is AI", () => {
    expect(images(withShare)).toEqual(["https://example.com/media/x/social-1.jpg"]);
  });

  it("offers the cover too when it is not AI", () => {
    expect(images({ ...withShare, heroImage: plain.heroImage })).toHaveLength(2);
  });

  it("falls back to the cover when there is no share image at all", () => {
    expect(images({ ...ai, socialImage: undefined })).toEqual([`https://example.com${ai.heroImage.src}`]);
  });
});

describe("a source photo is not an AI picture", () => {
  const photo = { src: "/media/x/cover-1.jpg", alt: "a", width: 1600, height: 900, credit: "Image: The Guardian", creditUrl: "https://example.com/story" };

  it("has a credit but wears no AI badge", () => {
    expect(isAiGenerated(photo)).toBe(false);
    expect(badges(renderToStaticMarkup(<ArticleCard article={{ ...base, heroImage: photo }} />))).toBe(0);
    expect(toFeatured({ ...base, heroImage: photo }).coverAi).toBe(false);
  });

  it("the explicit flag decides when present, the old credit text only when it is absent", () => {
    expect(isAiGenerated({ aiGenerated: true })).toBe(true);
    expect(isAiGenerated({ aiGenerated: false, credit: "Illustration generated with AI" })).toBe(false);
    expect(isAiGenerated({ credit: "Illustration generated with AI" })).toBe(true);     // stories exported before the flag existed
    expect(isAiGenerated({})).toBe(false);
  });

  it("the schema accepts a credit link and the AI flag, and refuses a link that is not a URL", async () => {
    const { imageSchema } = await import("@/core/article");
    expect(imageSchema.safeParse({ ...photo }).success).toBe(true);
    expect(imageSchema.safeParse({ ...photo, creditUrl: "not a url" }).success).toBe(false);
    expect(imageSchema.safeParse({ ...photo, aiGenerated: true }).success).toBe(true);
  });
});
