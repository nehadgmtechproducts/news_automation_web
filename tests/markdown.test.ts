import { describe, expect, it } from "vitest";
import { parseBody, parseInline, plainText } from "@/core/markdown";

describe("parseInline", () => {
  it("extracts citations and keeps surrounding text", () => {
    expect(parseInline("Apple said so [1][3].")).toEqual([
      { type: "text", text: "Apple said so " },
      { type: "cite", index: 1 },
      { type: "cite", index: 3 },
      { type: "text", text: "." },
    ]);
  });

  it("drops unresolved model markers like [Timeline]", () => {
    expect(plainText("Before [Timeline] after")).toBe("Before after");
  });

  it("never produces HTML: markup stays literal text", () => {
    const [node] = parseInline("<script>alert(1)</script>");
    expect(node).toEqual({ type: "text", text: "<script>alert(1)</script>" });
  });
});

describe("parseBody", () => {
  it("splits paragraphs and bullet lists", () => {
    const blocks = parseBody("Intro line\n\n- one [1]\n- two\n\nOutro");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "list", "paragraph"]);
    expect(blocks[1].type === "list" && blocks[1].items).toHaveLength(2);
  });
});
