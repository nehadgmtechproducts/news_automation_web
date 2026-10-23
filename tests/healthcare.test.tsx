import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HealthNotice } from "@/components/article/HealthNotice";
import { categoryTheme } from "@/config/category-theme";
import { buildFooterColumns } from "@/config/footer";
import { CATEGORIES, categoryBySlug } from "@/core/categories";
import { articleSchema } from "@/core/article";

const read = (f: string) => readFileSync(f, "utf8");
const firstArticle = readdirSync("content/articles").filter((f) => f.endsWith(".json"))[0];

describe("Healthcare category", () => {
  it("exists, has its own page URL and description", () => {
    expect(categoryBySlug("healthcare")?.name).toBe("Healthcare");
    expect(categoryBySlug("healthcare")?.description).toMatch(/medicine|health/i);
  });

  it("the article schema accepts it and still refuses invented categories", () => {
    const base = JSON.parse(read("content/articles/" + firstArticle));
    expect(articleSchema.safeParse({ ...base, category: "Healthcare" }).success).toBe(true);
    expect(articleSchema.safeParse({ ...base, category: "Health" }).success).toBe(false);
  });

  it("every category (including Healthcare) has theme classes AND a colour token that really exists", () => {
    const tokens = read("src/styles/tokens.css");
    for (const c of CATEGORIES) {
      expect(categoryTheme[c.name].text).toBe(`text-cat-${c.slug}`);
      expect(categoryTheme[c.name].bg).toBe(`bg-cat-${c.slug}`);
      expect(tokens, `colour token for ${c.name}`).toContain(`--color-cat-${c.slug}:`);
    }
  });

  it("is linked from the footer's Explore column", () => {
    expect(buildFooterColumns({ contactEmail: undefined, videos: false }).flatMap((c) => c.links.map((l) => l.href))).toContain("/category/healthcare");
  });

  it("the Standards page has a Healthcare rule that rules out cures and medical advice", () => {
    const page = read("src/app/standards/page.tsx");
    expect(page).toContain("<strong>Healthcare.</strong>");
    expect(page).toMatch(/never say something cures/);
    expect(page).toMatch(/no medical advice/);
  });

  it("health stories show a not-medical-advice note, and only health stories do", () => {
    const html = renderToStaticMarkup(<HealthNotice />);
    expect(html).toContain("not medical advice");
    expect(html).toContain('role="note"');
    expect(read("src/app/articles/[slug]/page.tsx")).toMatch(/article\.category === "Healthcare" && <HealthNotice \/>/);
  });
});
