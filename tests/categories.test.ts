import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articleSchema } from "@/core/article";
import { CATEGORIES, CATEGORY_NAMES, categoryByName, categoryBySlug } from "@/core/categories";
import { siteConfig } from "@/config/site";

const dir = path.join(process.cwd(), "content", "articles");
const first = JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8"));

describe("category taxonomy", () => {
  it("is the six agreed categories, in nav order", () => {
    expect([...CATEGORY_NAMES]).toEqual(["Technology", "Politics", "Finance", "Entertainment", "Launches", "Healthcare"]);
  });

  it("has unique, URL-safe slugs and round-trips by slug and name", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of CATEGORIES) {
      expect(c.slug).toMatch(/^[a-z]+$/);
      expect(categoryBySlug(c.slug)?.name).toBe(c.name);
      expect(categoryByName(c.name)?.slug).toBe(c.slug);
    }
    expect(categoryBySlug("artificial-intelligence")).toBeNull();
  });

  it("is reachable from the navigation", () => {
    const hrefs = siteConfig.nav.map((n) => n.href);
    for (const c of CATEGORIES) expect(hrefs).toContain(`/category/${c.slug}`);
  });
});

describe("article.category", () => {
  it.each(CATEGORIES.map((c) => c.name))("accepts %s", (name) => {
    expect(articleSchema.safeParse({ ...first, category: name }).success).toBe(true);
  });

  it.each(["Artificial Intelligence", "Technology / Privacy", "technology", ""])(
    "rejects the invented/legacy label %j",
    (label) => {
      expect(articleSchema.safeParse({ ...first, category: label }).success).toBe(false);
    },
  );
});
