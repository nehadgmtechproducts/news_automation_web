import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (f: string) => readFileSync(f, "utf8");

/**
 * Regression: opening a story's timeline in "Developing stories" made that panel taller, and the lead
 * story beside it stretched with it, so its cover image grew on every click. The panel must fill a box
 * it does not size (absolute + inset-0 inside a relative cell) and the lead card must have a fixed height.
 * (Layout itself is checked in a browser; these guard the classes that make it work.)
 */
describe("lead story height does not follow the developing-stories panel", () => {
  it("the panel is absolutely positioned inside its cell on wide screens, and scrolls", () => {
    const src = read("src/components/story/DevelopingStories.tsx");
    expect(src).toMatch(/<Panel className="[^"]*lg:absolute[^"]*lg:inset-0[^"]*lg:overflow-y-auto/);
    expect(src).not.toMatch(/<Panel className="[^"]*\bh-full\b/);       // h-full would let it drive the row
  });

  it("TopStory puts the panel in a relative box", () => {
    expect(read("src/components/home/TopStory.tsx")).toMatch(/<div className="relative">\s*<DevelopingStories/);
  });

  it("the lead card has a fixed height on wide screens, not a minimum", () => {
    const src = read("src/components/home/FeaturedStory.tsx");
    expect(src).toMatch(/lg:h-\[39rem\]/);
    expect(src).not.toMatch(/lg:min-h-/);
  });
});
