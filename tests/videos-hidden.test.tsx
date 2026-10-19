import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { articleSchema, withoutVideo, type Article } from "@/core/article";
import { navItems } from "@/config/site";

const dir = path.join(process.cwd(), "content", "articles");
const real: Article[] = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => articleSchema.parse(JSON.parse(readFileSync(path.join(dir, f), "utf8"))));
const withVideo = real.find((a) => a.video)!;

describe("withoutVideo", () => {
  it("removes only the video and leaves the article otherwise identical", () => {
    const stripped = withoutVideo(withVideo);
    expect(stripped.video).toBeUndefined();
    expect("video" in stripped).toBe(false);
    const expected: Article = { ...withVideo };
    delete expected.video;
    expect(stripped).toEqual(expected);
  });

  it("does not mutate the original (content files stay intact for when videos return)", () => {
    withoutVideo(withVideo);
    expect(withVideo.video).toBeDefined();
  });

  it("is harmless on an article that never had a video", () => {
    const none = withoutVideo(withoutVideo(withVideo));
    expect(none.video).toBeUndefined();
  });
});

describe("navItems", () => {
  it("has Watch only while videos are shown", () => {
    expect(navItems({ videos: true }).map((i) => i.label)).toContain("Watch");
    expect(navItems({ videos: false }).map((i) => i.label)).not.toContain("Watch");
  });

  it("is otherwise the same menu, in the same order", () => {
    const on = navItems({ videos: true }).map((i) => i.label);
    expect(navItems({ videos: false }).map((i) => i.label)).toEqual(on.filter((l) => l !== "Watch"));
  });
});

/** The data boundary: server/articles.ts reads SHOW_VIDEOS from the (mocked) environment. */
async function loadArticles(showVideos: boolean) {
  vi.resetModules();
  vi.doMock("@/config/env", () => ({ showVideos, siteUrl: "http://localhost:3000", readsFile: "x", subscribersFile: "y" }));
  return import("@/server/articles");
}
afterEach(() => vi.doUnmock("@/config/env"));

describe("server/articles with videos hidden or shown", () => {
  it("hidden: NO article anywhere carries a video, by list, by slug, and in the video list", async () => {
    const m = await loadArticles(false);
    expect((await m.getAllArticles()).some((a) => a.video)).toBe(false);
    expect((await m.getArticle(withVideo.slug))?.video).toBeUndefined();
    expect(await m.getVideoArticles()).toEqual([]);
  });

  it("shown: videos come through exactly as exported", async () => {
    const m = await loadArticles(true);
    expect((await m.getArticle(withVideo.slug))?.video).toEqual(withVideo.video);
    expect((await m.getVideoArticles()).length).toBeGreaterThan(0);
  });

  it("hiding videos changes nothing else about the articles", async () => {
    const hidden = await (await loadArticles(false)).getAllArticles();
    const shown = await (await loadArticles(true)).getAllArticles();
    expect(hidden.map((a) => a.slug)).toEqual(shown.map((a) => a.slug));
    expect(hidden.map((a) => a.title)).toEqual(shown.map((a) => a.title));
  });
});

describe("home layout with and without videos", () => {
  async function renderHome(articles: Article[]) {
    const { HomeContent } = await import("@/components/home/HomeContent");
    return renderToStaticMarkup(<HomeContent articles={articles} edition="Global" mostRead={[]} />);
  }

  it("with videos: a Watch row", async () => {
    const html = await renderHome(real);
    expect(html).toContain("Watch");
    expect(html).toContain('id="watch"');
  });

  it("without videos: NO Watch row and no video links or badges", async () => {
    const html = await renderHome(real.map(withoutVideo));
    expect(html).not.toContain('id="watch"');
    expect(html).not.toContain("See all videos");
    expect(html).not.toContain("/watch");
    expect(html).not.toContain("▶");                            // duration badges on the cards
  });

  it("the newsletter is not inside the home content (it is the banner above the footer)", async () => {
    for (const list of [real, real.map(withoutVideo)]) {
      const html = await renderHome(list);
      expect(html).not.toContain("Never miss a story");
    }
  });
});

describe("newsletter banner above the footer", () => {
  const subscribe = async () => ({ status: "idle" as const, message: "" });

  async function renderFooter(withBanner: boolean) {
    const { Footer } = await import("@/components/layout/Footer");
    const { NewsletterSignup } = await import("@/components/client/NewsletterSignup");
    return renderToStaticMarkup(<Footer newsletter={withBanner ? <NewsletterSignup action={subscribe} /> : undefined} />);
  }

  it("shows the headline, the sentence, a labelled email field and the Subscribe button, before the footer", async () => {
    const html = await renderFooter(true);
    expect(html).toContain("Never miss a story");
    expect(html).toContain("Daily roundup of the biggest stories from around the world.");
    expect(html).toContain('placeholder="Enter your email"');
    expect(html).toContain("We&#x27;ll only use your email for the daily roundup.");
    expect(html).toMatch(/<label[^>]*for="newsletter-email"[^>]*>Email address<\/label>/);
    expect(html).toContain("Subscribe");
    expect(html.indexOf("Never miss a story")).toBeLessThan(html.indexOf("<footer"));   // above the footer
    expect(html.match(/name="email"/g)).toHaveLength(1);                            // one form only
  });

  it("keeps the spam trap and posts to the server action form", async () => {
    const html = await renderFooter(true);
    expect(html).toContain('name="website"');
    expect(html).toContain("<form");
  });

  it("the footer still renders without a banner", async () => {
    const html = await renderFooter(false);
    expect(html).not.toContain("Never miss a story");
    expect(html).toContain("<footer");
  });
});
