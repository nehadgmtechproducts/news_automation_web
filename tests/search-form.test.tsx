import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SearchForm } from "@/components/search/SearchForm";

describe("SearchForm", () => {
  const html = renderToStaticMarkup(<SearchForm id="t" />);

  it("is a GET form to /search with the query in `q`", () => {
    expect(html).toContain('action="/search"');
    expect(html).toContain('method="get"');
    expect(html).toContain('name="q"');
  });

  it("has a real, labelled submit button, so clicking the magnifier searches", () => {
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*aria-label="Search"/);
  });

  it("does not mention companies, and keeps the typed value when given one", () => {
    expect(html).not.toContain("companies");
    expect(renderToStaticMarkup(<SearchForm id="t" defaultValue="musk" />)).toContain('value="musk"');
  });
});
