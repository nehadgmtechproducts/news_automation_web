import { describe, expect, it } from "vitest";
import { formatDate, formatDuration, toIsoDuration } from "@/core/format";
import { slugify } from "@/core/slug";

describe("format", () => {
  it("formats durations for badges and for schema.org", () => {
    expect(formatDuration(42.77)).toBe("0:43");
    expect(toIsoDuration(42.77)).toBe("PT43S");
    expect(toIsoDuration(125)).toBe("PT2M5S");
    expect(toIsoDuration(120)).toBe("PT2M");
  });

  it("formats dates in UTC so server and browser agree", () => {
    expect(formatDate("2026-10-05T23:30:00Z")).toBe("Oct 5, 2026");
  });

  it("slugifies categories", () => {
    expect(slugify("Technology / Privacy")).toBe("technology-privacy");
    expect(slugify("AI & Robots")).toBe("ai-and-robots");
    expect(slugify("What\u2019s new?")).toBe("whats-new");
    expect(slugify("What's new?")).toBe("whats-new");
  });
});
