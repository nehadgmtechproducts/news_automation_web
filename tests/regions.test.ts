import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema } from "@/core/article";
import { REGIONS, REGION_NAMES, editionPath, filterByEdition, hasOwnStories, regionBySlug, type RegionName } from "@/core/regions";

const dir = path.join(process.cwd(), "content", "articles");
const first = JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8"));
/** Synthetic stand-ins, used only inside tests. */
const s = (id: string, region: RegionName) => ({ id, region });

describe("regions", () => {
  it("are the six editions, in the order the bar shows them", () => {
    expect([...REGION_NAMES]).toEqual(["Global", "Asia", "Europe", "Americas", "Middle East", "Africa"]);
  });

  it("have unique URL-safe slugs and round-trip", () => {
    const slugs = REGIONS.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const r of REGIONS) {
      expect(r.slug).toMatch(/^[a-z-]+$/);
      expect(regionBySlug(r.slug)?.name).toBe(r.name);
    }
    expect(regionBySlug("atlantis")).toBeNull();
  });

  it("send Global to the home page and the rest to /edition/<slug>", () => {
    expect(editionPath(REGIONS[0])).toBe("/");
    expect(editionPath(regionBySlug("middle-east")!)).toBe("/edition/middle-east");
  });
});

describe("filterByEdition", () => {
  const all = [s("g", "Global"), s("a", "Asia"), s("e", "Europe"), s("a2", "Asia")];

  it("Global shows everything", () => {
    expect(filterByEdition(all, "Global").map((x) => x.id)).toEqual(["g", "a", "e", "a2"]);
  });

  it("a regional edition shows its own stories PLUS the global ones, never other regions", () => {
    expect(filterByEdition(all, "Asia").map((x) => x.id)).toEqual(["g", "a", "a2"]);
    expect(filterByEdition(all, "Europe").map((x) => x.id)).toEqual(["g", "e"]);
  });

  it("a region with no stories of its own still shows the global ones (never an empty page)", () => {
    expect(filterByEdition(all, "Africa").map((x) => x.id)).toEqual(["g"]);
  });

  it("keeps newest-first order", () => {
    expect(filterByEdition([s("1", "Asia"), s("2", "Global"), s("3", "Asia")], "Asia").map((x) => x.id)).toEqual(["1", "2", "3"]);
  });
});

describe("hasOwnStories", () => {
  it("is about the region's own stories, not the shared global ones", () => {
    const all = [s("g", "Global"), s("a", "Asia")];
    expect(hasOwnStories(all, "Asia")).toBe(true);
    expect(hasOwnStories(all, "Africa")).toBe(false);
    expect(hasOwnStories(all, "Global")).toBe(true);
    expect(hasOwnStories([], "Global")).toBe(false);
  });
});

describe("article.region", () => {
  it.each(REGION_NAMES)("accepts %s", (name) => {
    expect(articleSchema.safeParse({ ...first, region: name }).success).toBe(true);
  });

  it.each(["Eastern Europe", "asia", "", undefined])("rejects %j (invented, wrong case or missing)", (value) => {
    expect(articleSchema.safeParse({ ...first, region: value }).success).toBe(false);
  });
});
