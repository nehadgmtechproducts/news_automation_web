import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema, distinctSourceCount } from "@/core/article";
import { FileArticleRepository } from "@/server/file-repository";
import { newsArticleJsonLd, videoObjectJsonLd } from "@/seo/json-ld";

const dir = path.join(process.cwd(), "content", "articles");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const load = (f: string) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));

describe("content contract", () => {
  it.each(files)("%s satisfies the schema", (f) => {
    expect(articleSchema.safeParse(load(f)).success).toBe(true);
  });

  it("rejects an article with fewer than two sources", () => {
    const a = load(files[0]);
    a.sources = a.sources.slice(0, 1);
    expect(articleSchema.safeParse(a).success).toBe(false);
  });

  it("counts distinct publishers, not links", () => {
    const a = articleSchema.parse(load(files[0]));
    expect(distinctSourceCount({ sources: [a.sources[0], a.sources[0]] })).toBe(1);
  });

  it("every [n] citation in the body points at a real source", () => {
    for (const f of files) {
      const a = articleSchema.parse(load(f));
      const valid = new Set(a.sources.map((s) => s.index));
      const text = [...a.sections.map((s) => s.body), a.whyItMatters].join(" ");
      for (const m of text.matchAll(/\[(\d+)\]/g)) expect(valid.has(Number(m[1]))).toBe(true);
    }
  });
});

describe("repository", () => {
  it("returns newest first and null for unknown slugs", async () => {
    const repo = new FileArticleRepository();
    const list = await repo.list();
    expect(list.length).toBe(files.length);
    for (let i = 1; i < list.length; i++) expect(list[i - 1].publishedAt >= list[i].publishedAt).toBe(true);
    expect(await repo.bySlug("nope")).toBeNull();
  });

  it("returns [] when the content directory is missing", async () => {
    expect(await new FileArticleRepository("/nonexistent/dir").list()).toEqual([]);
  });
});

describe("structured data", () => {
  const a = articleSchema.parse(load(files[0]));
  it("emits absolute URLs and an ISO duration", () => {
    const origin = "https://example.com";
    const news = newsArticleJsonLd(a, origin) as Record<string, unknown>;
    expect(news["@type"]).toBe("NewsArticle");
    expect((news.image as string[])[0]).toMatch(/^https:\/\/example\.com\//);
    const video = videoObjectJsonLd(a, origin) as Record<string, unknown>;
    expect(video.duration).toMatch(/^PT/);
  });
});

describe("imageSchema credit", () => {
  const image = { src: "/media/x/cover-1.jpg", alt: "alt", width: 1600, height: 900 };

  it("is optional, and when present must not be empty", async () => {
    const { imageSchema } = await import("@/core/article");
    expect(imageSchema.safeParse(image).success).toBe(true);
    expect(imageSchema.safeParse({ ...image, credit: "Illustration generated with AI" }).success).toBe(true);
    expect(imageSchema.safeParse({ ...image, credit: "" }).success).toBe(false);
  });
});
