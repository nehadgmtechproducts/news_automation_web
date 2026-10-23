import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildFooterColumns, legalLinks, type FooterLink } from "@/config/footer";
import { CATEGORIES } from "@/core/categories";
import { REGIONS } from "@/core/regions";

/** Is there a page file for this internal URL? Mirrors the routes under src/app. */
function pageExists(href: string): boolean {
  const url = href.split("#")[0];
  const app = path.join(process.cwd(), "src", "app");
  const has = (...p: string[]) => existsSync(path.join(app, ...p, "page.tsx"));
  if (url === "/") return has();
  if (url.startsWith("/category/")) return has("category", "[category]");
  if (url.startsWith("/edition/")) return has("edition", "[edition]");
  return has(...url.split("/").filter(Boolean));
}

const internal = (links: FooterLink[]) => links.filter((l) => l.href.startsWith("/"));
const all = (email?: string) => buildFooterColumns({ contactEmail: email }).flatMap((c) => c.links);

describe("footer links", () => {
  it("has the three columns of the design, in order", () => {
    expect(buildFooterColumns().map((c) => c.title)).toEqual(["Explore", "Edition", "About"]);
  });

  it("EVERY internal link (footer and legal) points at a page that exists", () => {
    const dead = [...internal(all("a@b.co")), ...internal(legalLinks)].filter((l) => !pageExists(l.href));
    expect(dead, `dead footer links: ${dead.map((d) => d.href).join(", ")}`).toEqual([]);
  });

  it("Explore lists every category and the news pages; Edition lists every region", () => {
    const [explore, edition] = buildFooterColumns();
    expect(explore.links.map((l) => l.label)).toEqual(["Latest News", "Developing Stories", ...CATEGORIES.map((c) => c.name), "Watch"]);
    expect(edition.links.map((l) => l.label)).toEqual(REGIONS.map((r) => r.name));
    expect(edition.links[0].href).toBe("/");                                       // Global is the home page
  });

  it("drops the Watch link when videos are hidden, and keeps everything else", () => {
    const withWatch = buildFooterColumns({ videos: true })[0].links.map((l) => l.label);
    const withoutWatch = buildFooterColumns({ videos: false })[0].links.map((l) => l.label);
    expect(withWatch).toContain("Watch");
    expect(withoutWatch).not.toContain("Watch");
    expect(withoutWatch).toEqual(withWatch.filter((l) => l !== "Watch"));
  });

  it("About has About Us and Editorial Standards, and not the two links the owner dropped", () => {
    const labels = buildFooterColumns({ contactEmail: "a@b.co" })[2].links.map((l) => l.label);
    expect(labels).toEqual(["About Us", "Editorial Standards", "Contact Us"]);
    expect(labels).not.toContain("How We Verify");
    expect(labels).not.toContain("Advertise With Us");
  });

  it("shows 'Contact Us' only when a real address is configured", () => {
    expect(buildFooterColumns()[2].links.map((l) => l.label)).not.toContain("Contact Us");
    const contact = buildFooterColumns({ contactEmail: "news@example.com" })[2].links.find((l) => l.label === "Contact Us");
    expect(contact?.href).toBe("mailto:news@example.com");
  });

  it("has the three legal links of the design", () => {
    expect(legalLinks.map((l) => l.label)).toEqual(["Privacy Policy", "Terms of Use", "Cookie Preferences"]);
  });

  it("has no duplicate labels inside a column", () => {
    for (const col of buildFooterColumns({ contactEmail: "a@b.co" })) {
      const labels = col.links.map((l) => l.label);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });
});

// ------------------------------------------------------------------------------------------
// Regression: a grid that becomes columns at `lg` must be `grid-cols-1` below it. Without that the
// single column is `auto`-sized, and a child that cannot wrap (the six unwrappable category tabs)
// widens the whole track, so the PAGE scrolls sideways on a phone.
import { readFileSync } from "node:fs";

describe("stacked grids on the home page", () => {
  // The page-level grids live in HomeContent and in TopStory (the lead card beside Developing stories).
  const source = ["HomeContent", "TopStory"]
    .map((f) => readFileSync(path.join(process.cwd(), `src/components/home/${f}.tsx`), "utf8"))
    .join("\n");
  const stacked = [...source.matchAll(/className="(grid[^"]*lg:grid-cols-\[[^"]*)"/g)].map((m) => m[1]);

  it("finds the page-level grids", () => {
    expect(stacked.length).toBeGreaterThanOrEqual(3);
  });

  it.each(stacked.map((c) => [c]))("is grid-cols-1 below lg: %s", (classes) => {
    expect(classes.split(/\s+/)).toContain("grid-cols-1");
  });
});
