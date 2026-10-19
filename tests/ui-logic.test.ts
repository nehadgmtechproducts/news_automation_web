import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema, type Article } from "@/core/article";
import { relativeTime } from "@/core/format";
import { buildOutline } from "@/core/outline";
import { searchArticles, tokenize } from "@/core/search";
import { cn } from "@/lib/cn";

const dir = path.join(process.cwd(), "content", "articles");
const real: Article[] = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => articleSchema.parse(JSON.parse(readFileSync(path.join(dir, f), "utf8"))));

/** A minimal valid article, overridable per test (synthetic — used only inside tests). */
function make(over: Partial<Article>): Article {
  return { ...real[0], ...over };
}

describe("relativeTime", () => {
  const now = Date.parse("2026-10-07T12:00:00Z");
  const ago = (min: number) => new Date(now - min * 60_000).toISOString();

  it("labels recent times", () => {
    expect(relativeTime(ago(0), now)).toBe("just now");
    expect(relativeTime(ago(10), now)).toBe("10 min ago");
    expect(relativeTime(ago(60), now)).toBe("1 hour ago");
    expect(relativeTime(ago(180), now)).toBe("3 hours ago");
    expect(relativeTime(ago(60 * 24), now)).toBe("1 day ago");
    expect(relativeTime(ago(60 * 24 * 3), now)).toBe("3 days ago");
  });

  it("falls back to a date after a week, and never shows a negative time", () => {
    expect(relativeTime(ago(60 * 24 * 10), now)).toBe("Sep 27, 2026");
    expect(relativeTime(ago(-5), now)).toBe("just now"); // slight clock skew
  });
});

describe("buildOutline", () => {
  it("ids match slugified headings and include the fixed sections", () => {
    const items = buildOutline(make({ keyTakeaways: ["a"], sections: [{ heading: "What's new?", body: "x" }] }));
    expect(items.map((i) => i.id)).toEqual(["key-takeaways", "whats-new", "why-it-matters", "sources"]);
  });

  it("de-duplicates repeated headings and avoids reserved ids", () => {
    const items = buildOutline(
      make({ keyTakeaways: [], sections: [{ heading: "Sources", body: "x" }, { heading: "Sources", body: "y" }, { heading: "Why it matters", body: "z" }] }),
    );
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("key-takeaways");
  });
});

describe("search", () => {
  it("tokenizes and drops noise", () => {
    expect(tokenize("Apple, & the  M4!")).toEqual(["apple", "the", "m4"]);
    expect(tokenize("a")).toEqual([]);
  });

  it("requires every word, ranks title matches first, and returns nothing for an empty query", () => {
    const a = make({ id: "a", title: "Apple tightens disk access", entity: "Apple", keywords: [], dek: "d", sections: [{ heading: "h", body: "b" }] });
    const b = make({ id: "b", title: "Nvidia launches platform", entity: "Nvidia", keywords: ["Apple"], dek: "d", sections: [{ heading: "h", body: "b" }] });
    expect(searchArticles([a, b], "apple").map((x) => x.id)).toEqual(["a", "b"]);
    expect(searchArticles([a, b], "apple nvidia").map((x) => x.id)).toEqual(["b"]);
    expect(searchArticles([a, b], "zzz")).toEqual([]);
    expect(searchArticles([a, b], "  ")).toEqual([]);
  });
});

describe("cn", () => {
  it("joins truthy class names only", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("content images", () => {
  const onDisk = (src: string) => existsSync(path.join(process.cwd(), "public", src));

  it.each(real.map((a) => [a.slug, a] as const))("%s: text-free hero + titled social card, hash-named", (_slug, a) => {
    expect(a.heroImage.width).toBe(1600);
    expect(a.heroImage.src).toMatch(/\/cover-[0-9a-f]{8}\.jpg$/);
    expect(a.socialImage?.src).toMatch(/\/social-[0-9a-f]{8}\.jpg$/);
    // Hash-named files are the cache-busting rule (see README): a bare name would go stale.
    // Video is optional (articles-only stories have none); when present its files are hash-named too.
    if (a.video) expect(a.video.poster).toMatch(/\/poster-[0-9a-f]{8}\.jpg$/);
  });

  it.each(real.map((a) => [a.slug, a] as const))("%s: every referenced image exists", (_slug, a) => {
    const referenced = [a.heroImage.src, a.socialImage?.src, a.video?.poster, a.video?.src].filter((s): s is string => Boolean(s));
    expect(referenced.length).toBeGreaterThanOrEqual(2);                       // at least cover + social card
    for (const src of referenced) expect(onDisk(src), `${src} is missing from public/`).toBe(true);
  });
});

import { pickActiveId } from "@/core/scrollspy";

describe("pickActiveId (scroll-spy rule)", () => {
  const at = (...tops: number[]) => tops.map((top, i) => ({ id: `h${i}`, top }));

  it("is the last heading that has passed the line", () => {
    expect(pickActiveId(at(-900, -200, 90, 400), 140, false)).toBe("h2");
    expect(pickActiveId(at(-900, -200, 100, 120), 140, false)).toBe("h3");
  });

  it("is the first heading before any has passed the line", () => {
    expect(pickActiveId(at(300, 700, 1100), 140, false)).toBe("h0");
  });

  it("does not stay stuck on the previous heading when its tail is still visible", () => {
    // regression: the old 'topmost visible section' rule picked h1 here
    expect(pickActiveId(at(-500, -460, 120), 140, false)).toBe("h2");
  });

  it("is the last heading at the bottom of the page, even if it never reached the line", () => {
    expect(pickActiveId(at(-900, 200, 500), 140, true)).toBe("h2");
  });

  it("handles no headings", () => {
    expect(pickActiveId([], 140, false)).toBeUndefined();
  });
});
