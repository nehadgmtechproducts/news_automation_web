import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { emptyReads, isBot, mostRead, prune, recordRead, WINDOW_HOURS, type ReadsState } from "@/core/reads";
import { handleReadRequest, type ReadDeps } from "@/server/read-handler";
import { FileReadStore } from "@/server/read-store";

const at = (iso: string) => new Date(iso);
const NOW = at("2026-10-07T12:30:00Z");

describe("recordRead", () => {
  it("counts a first read and ignores the same visitor reading the same article again that day", () => {
    const a = recordRead(emptyReads(), "story", "v1", NOW);
    expect(a.counted).toBe(true);
    const b = recordRead(a.state, "story", "v1", at("2026-10-07T18:00:00Z"));   // later the same UTC day
    expect(b.counted).toBe(false);
    expect(mostRead(b.state, at("2026-10-07T19:00:00Z"))).toEqual([{ slug: "story", reads: 1 }]);
  });

  it("counts different visitors, and the same visitor on different articles", () => {
    let s = emptyReads();
    for (const [slug, v] of [["a", "v1"], ["a", "v2"], ["b", "v1"]] as const) s = recordRead(s, slug, v, NOW).state;
    expect(mostRead(s, NOW)).toEqual([{ slug: "a", reads: 2 }, { slug: "b", reads: 1 }]);
  });

  it("counts the same visitor again on the next day", () => {
    const day1 = recordRead(emptyReads(), "a", "v1", NOW).state;
    expect(recordRead(day1, "a", "v1", at("2026-10-08T09:00:00Z")).counted).toBe(true);
  });

  it("never mutates the state it was given", () => {
    const before = emptyReads();
    recordRead(before, "a", "v1", NOW);
    expect(before).toEqual(emptyReads());
  });
});

describe("mostRead (the rolling 24 hours)", () => {
  const state = () => {
    let s = emptyReads();
    s = recordRead(s, "old", "v1", at("2026-10-06T10:00:00Z")).state;     // 26.5h before NOW: outside the window
    s = recordRead(s, "edge", "v2", at("2026-10-06T13:10:00Z")).state;    // inside (same hour as the cut-off)
    s = recordRead(s, "new", "v3", at("2026-10-07T12:10:00Z")).state;
    s = recordRead(s, "new", "v4", at("2026-10-07T12:20:00Z")).state;
    return s;
  };

  it("sums only the last 24 hours, most-read first", () => {
    expect(WINDOW_HOURS).toBe(24);
    expect(mostRead(state(), NOW).map((r) => r.slug)).toEqual(["new", "edge"]);
  });

  it("is empty when nothing has been read", () => {
    expect(mostRead(emptyReads(), NOW)).toEqual([]);
  });

  it("respects the limit and gives ties a stable order", () => {
    let s = emptyReads();
    for (const slug of ["c", "a", "b"]) s = recordRead(s, slug, "v", NOW).state;
    expect(mostRead(s, NOW, 2).map((r) => r.slug)).toEqual(["a", "b"]);
  });
});

describe("prune (privacy: old salts and counts are deleted)", () => {
  it("drops data older than 48 hours, salts included, and keeps recent data", () => {
    let s: ReadsState = { ...emptyReads(), salts: { "2026-10-04": "old-salt", "2026-10-07": "fresh-salt" } };
    s = recordRead(s, "a", "v", at("2026-10-04T10:00:00Z")).state;
    s = recordRead(s, "b", "v", NOW).state;
    const p = prune(s, NOW);
    expect(Object.keys(p.salts)).toEqual(["2026-10-07"]);
    expect(Object.keys(p.seen)).toEqual(["2026-10-07"]);
    expect(Object.values(p.hours).flatMap((h) => Object.keys(h))).toEqual(["b"]);
  });
});

describe("isBot", () => {
  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)", "Mozilla/5.0 (compatible; bingbot/2.0)", "facebookexternalhit/1.1",
    "Slackbot-LinkExpanding 1.0", "curl/8.4.0", "python-requests/2.31", "Mozilla/5.0 HeadlessChrome/120", "Twitterbot/1.0", "",
  ])("treats %j as a bot", (ua) => expect(isBot(ua)).toBe(true));

  it.each([
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  ])("treats a real browser as a person", (ua) => expect(isBot(ua)).toBe(false));

  it("treats a missing user agent as not a browser", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------- handler
const BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

function harness(slugs = ["real-story"]) {
  const recorded: { slug: string; ip: string; ua: string }[] = [];
  const deps: ReadDeps = {
    knownSlugs: async () => new Set(slugs),
    record: async (slug, ip, ua) => { recorded.push({ slug, ip, ua }); return true; },
  };
  const post = (body: string, headers: Record<string, string> = {}) =>
    handleReadRequest(new Request("http://site.test/api/read", { method: "POST", body, headers: { host: "site.test", "user-agent": BROWSER, ...headers } }), deps);
  return { recorded, post };
}

describe("POST /api/read", () => {
  it("counts a valid read and answers 204", async () => {
    const h = harness();
    const res = await h.post(JSON.stringify({ slug: "real-story" }), { "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(res.status).toBe(204);
    expect(h.recorded).toEqual([{ slug: "real-story", ip: "203.0.113.9", ua: BROWSER }]);   // first hop only
  });

  it("accepts a same-origin request and refuses a cross-origin one", async () => {
    const h = harness();
    expect((await h.post(JSON.stringify({ slug: "real-story" }), { origin: "http://site.test" })).status).toBe(204);
    expect((await h.post(JSON.stringify({ slug: "real-story" }), { origin: "https://evil.example" })).status).toBe(403);
    expect((await h.post(JSON.stringify({ slug: "real-story" }), { origin: "not a url" })).status).toBe(403);
    expect(h.recorded).toHaveLength(1);
  });

  it("ignores bots but still answers 204 (the endpoint reveals nothing)", async () => {
    const h = harness();
    expect((await h.post(JSON.stringify({ slug: "real-story" }), { "user-agent": "Googlebot/2.1" })).status).toBe(204);
    expect(h.recorded).toHaveLength(0);
  });

  it("rejects unknown slugs, malformed slugs, bad JSON and oversized bodies", async () => {
    const h = harness();
    expect((await h.post(JSON.stringify({ slug: "no-such-story" }))).status).toBe(404);
    expect((await h.post(JSON.stringify({ slug: "../../etc/passwd" }))).status).toBe(400);
    expect((await h.post(JSON.stringify({ slug: "Has Spaces" }))).status).toBe(400);
    expect((await h.post(JSON.stringify({ slug: 42 }))).status).toBe(400);
    expect((await h.post("not json")).status).toBe(400);
    expect((await h.post(JSON.stringify({ slug: "real-story", pad: "x".repeat(2000) }))).status).toBe(413);
    expect(h.recorded).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------- store
describe("FileReadStore", () => {
  const tmp = async () => path.join(await mkdtemp(path.join(os.tmpdir(), "reads-")), "nested", "reads.json");

  it("creates its folder, counts, and persists across instances", async () => {
    const file = await tmp();
    expect(await new FileReadStore(file).record("a", "1.1.1.1", BROWSER, NOW)).toBe(true);
    const again = new FileReadStore(file);
    expect(mostRead(await again.load(), NOW)).toEqual([{ slug: "a", reads: 1 }]);
  });

  it("counts the same visitor once per article per day, and different visitors separately", async () => {
    const store = new FileReadStore(await tmp());
    expect(await store.record("a", "1.1.1.1", BROWSER, NOW)).toBe(true);
    expect(await store.record("a", "1.1.1.1", BROWSER, NOW)).toBe(false);
    expect(await store.record("a", "2.2.2.2", BROWSER, NOW)).toBe(true);
    expect(mostRead(await store.load(), NOW)).toEqual([{ slug: "a", reads: 2 }]);
  });

  it("loses no reads when many arrive at once (writes are serialised)", async () => {
    const store = new FileReadStore(await tmp());
    await Promise.all(Array.from({ length: 40 }, (_, i) => store.record("busy", `10.0.0.${i}`, BROWSER, NOW)));
    expect(mostRead(await store.load(), NOW)).toEqual([{ slug: "busy", reads: 40 }]);
  });

  it("stores no IP address or user agent, only counts and hashes", async () => {
    const file = await tmp();
    await new FileReadStore(file).record("a", "203.0.113.77", BROWSER, NOW);
    const raw = await readFile(file, "utf8");
    expect(raw).not.toContain("203.0.113.77");
    expect(raw).not.toContain("Macintosh");
  });

  it("treats a corrupt file as 'no reads yet' and recovers on the next write", async () => {
    const file = await tmp();
    const store = new FileReadStore(file);
    await store.record("seed", "1.1.1.1", BROWSER, NOW);              // creates the folder
    await writeFile(file, "{ this is not json");
    expect(await store.load()).toEqual(emptyReads());
    expect(await store.record("a", "1.1.1.1", BROWSER, NOW)).toBe(true);
    expect(mostRead(await store.load(), NOW)).toEqual([{ slug: "a", reads: 1 }]);
  });
});

// ---------------------------------------------------------------------------- pickMostRead
import { readFileSync, readdirSync } from "node:fs";
import { articleSchema, type Article } from "@/core/article";
import { pickMostRead } from "@/core/reads";

describe("pickMostRead (what 'Most read today' lists)", () => {
  const dir = path.join(process.cwd(), "content", "articles");
  const base: Article = articleSchema.parse(JSON.parse(readFileSync(path.join(dir, readdirSync(dir).filter((f) => f.endsWith(".json"))[0]), "utf8")));
  /** Synthetic articles, used only inside tests. */
  const art = (slug: string): Article => ({ ...base, id: slug, slug });
  const [a, b, c] = [art("a"), art("b"), art("c")];
  const readsFor = (spec: [string, number][]) => {
    let s = emptyReads();
    spec.forEach(([slug, n]) => { for (let i = 0; i < n; i++) s = recordRead(s, slug, `v-${slug}-${i}`, NOW).state; });
    return s;
  };

  it("lists only stories that were actually read, most-read first", () => {
    expect(pickMostRead(readsFor([["b", 3], ["a", 1]]), [a, b, c], NOW).map((x) => x.slug)).toEqual(["b", "a"]);   // c: no reads, absent
  });

  it("is EMPTY when nothing has been read — never padded with unread stories", () => {
    expect(pickMostRead(emptyReads(), [a, b, c], NOW)).toEqual([]);
  });

  it("ranks only the articles it is given (an edition page ranks its own stories)", () => {
    expect(pickMostRead(readsFor([["c", 9], ["a", 1]]), [a, b], NOW).map((x) => x.slug)).toEqual(["a"]);
  });

  it("ignores reads of articles that no longer exist", () => {
    expect(pickMostRead(readsFor([["deleted-story", 5]]), [a], NOW)).toEqual([]);
  });

  it("respects the limit and the 24-hour window", () => {
    const s = readsFor([["a", 3], ["b", 2], ["c", 1]]);
    expect(pickMostRead(s, [a, b, c], NOW, 2).map((x) => x.slug)).toEqual(["a", "b"]);
    expect(pickMostRead(s, [a, b, c], at("2026-10-09T12:30:00Z"))).toEqual([]);   // 2 days later: all outside the window
  });
});
