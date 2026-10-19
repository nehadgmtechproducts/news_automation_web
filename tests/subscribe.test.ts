import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { initialSubscribeState, parseSignup } from "@/core/subscribe";
import { RateLimiter } from "@/server/rate-limit";
import { handleSubscribe, type SubscribeDeps } from "@/server/subscribe-handler";
import { FileSubscriberStore } from "@/server/subscriber-store";

describe("parseSignup", () => {
  it("accepts a valid address, trimmed and lower-cased", () => {
    expect(parseSignup({ email: "  Reader@Example.COM " })).toEqual({ kind: "ok", email: "reader@example.com" });
  });

  it.each(["", "   ", "plain", "a@b", "@example.com", "a b@example.com", "a@@example.com", 42, null, undefined])(
    "rejects %j",
    (bad) => expect(parseSignup({ email: bad }).kind).toBe("invalid"),
  );

  it("rejects an address over 254 characters", () => {
    expect(parseSignup({ email: `${"a".repeat(250)}@example.com` }).kind).toBe("invalid");
  });

  it("treats a filled honeypot as spam, whatever the email", () => {
    expect(parseSignup({ email: "real@example.com", website: "http://spam.example" })).toEqual({ kind: "spam" });
    expect(parseSignup({ email: "real@example.com", website: "   " }).kind).toBe("ok");   // blank = a person
  });

  it("starts idle", () => {
    expect(initialSubscribeState).toEqual({ status: "idle", message: "" });
  });
});

describe("RateLimiter", () => {
  it("allows up to the limit, then refuses, per key", () => {
    const rl = new RateLimiter(3, 1000);
    expect([1, 2, 3, 4].map(() => rl.allow("a", 0))).toEqual([true, true, true, false]);
    expect(rl.allow("b", 0)).toBe(true);                       // another source is unaffected
  });

  it("forgets attempts once the window has passed", () => {
    const rl = new RateLimiter(1, 1000);
    expect(rl.allow("a", 0)).toBe(true);
    expect(rl.allow("a", 999)).toBe(false);
    expect(rl.allow("a", 1000)).toBe(true);
  });

  it("does not count refused attempts against the window", () => {
    const rl = new RateLimiter(1, 1000);
    rl.allow("a", 0);
    for (let t = 100; t < 900; t += 100) rl.allow("a", t);     // hammering while blocked
    expect(rl.allow("a", 1000)).toBe(true);                    // still frees up on schedule
  });
});

describe("handleSubscribe", () => {
  const NOW = new Date("2026-10-18T10:00:00Z");
  function setup(over: Partial<SubscribeDeps> = {}) {
    const stored: string[] = [];
    const deps: SubscribeDeps = {
      add: async (email) => (stored.includes(email) ? "exists" : (stored.push(email), "added")),
      allow: () => true,
      now: () => NOW,
      ...over,
    };
    return { stored, run: (input: { email: unknown; website?: unknown }) => handleSubscribe({ ...input, ip: "1.2.3.4" }, deps) };
  }

  it("stores a valid address and reports success", async () => {
    const t = setup();
    expect((await t.run({ email: "A@Example.com" })).status).toBe("success");
    expect(t.stored).toEqual(["a@example.com"]);
  });

  it("gives an already-subscribed address the IDENTICAL response (the form can't be used to look people up)", async () => {
    const t = setup();
    const first = await t.run({ email: "a@example.com" });
    const again = await t.run({ email: "a@example.com" });
    expect(again).toEqual(first);
    expect(t.stored).toHaveLength(1);
  });

  it("stores nothing for a bot but looks like success", async () => {
    const t = setup();
    const res = await t.run({ email: "bot@example.com", website: "filled" });
    expect(res.status).toBe("success");
    expect(t.stored).toEqual([]);
  });

  it("returns a plain error for an invalid address, echoing it back, and stores nothing", async () => {
    const t = setup();
    const res = await t.run({ email: "not-an-email" });
    expect(res).toMatchObject({ status: "error", email: "not-an-email" });
    expect(t.stored).toEqual([]);
  });

  it("refuses when the source has made too many attempts", async () => {
    const t = setup({ allow: () => false });
    const res = await t.run({ email: "a@example.com" });
    expect(res.status).toBe("error");
    expect(res.message).toMatch(/too many/i);
    expect(t.stored).toEqual([]);
  });

  it("does not spend a rate-limit attempt on spam or invalid input", async () => {
    let attempts = 0;
    const t = setup({ allow: () => (attempts++, true) });
    await t.run({ email: "x@example.com", website: "spam" });
    await t.run({ email: "nope" });
    expect(attempts).toBe(0);
  });

  it("reports a storage failure as an error without leaking details", async () => {
    const t = setup({ add: async () => { throw new Error("EACCES: /secret/path"); } });
    const res = await t.run({ email: "a@example.com" });
    expect(res.status).toBe("error");
    expect(res.message).not.toContain("EACCES");
    expect(res.message).not.toContain("/secret");
  });
});

describe("FileSubscriberStore", () => {
  const NOW = new Date("2026-10-18T10:00:00Z");
  const tmp = async () => path.join(await mkdtemp(path.join(os.tmpdir(), "subs-")), "nested", "subscribers.json");

  it("creates its folder, saves, and persists across instances", async () => {
    const file = await tmp();
    expect(await new FileSubscriberStore(file).add("a@example.com", NOW)).toBe("added");
    expect(await new FileSubscriberStore(file).list()).toEqual([{ email: "a@example.com", subscribedAt: NOW.toISOString(), source: "home" }]);
  });

  it("does not add the same address twice", async () => {
    const store = new FileSubscriberStore(await tmp());
    expect(await store.add("a@example.com", NOW)).toBe("added");
    expect(await store.add("a@example.com", NOW)).toBe("exists");
    expect(await store.list()).toHaveLength(1);
  });

  it("loses no sign-ups when many arrive at once", async () => {
    const store = new FileSubscriberStore(await tmp());
    await Promise.all(Array.from({ length: 30 }, (_, i) => store.add(`user${i}@example.com`, NOW)));
    expect(await store.list()).toHaveLength(30);
  });

  it("keeps the file private to its owner (addresses are personal data)", async () => {
    const file = await tmp();
    await new FileSubscriberStore(file).add("a@example.com", NOW);
    expect((await stat(file)).mode & 0o077).toBe(0);           // no group/other permissions
  });

  it("NEVER overwrites a corrupt file: the sign-up fails and the file is left for a human", async () => {
    const file = await tmp();
    const store = new FileSubscriberStore(file);
    await store.add("seed@example.com", NOW);
    await writeFile(file, "{ corrupt but precious");
    await expect(store.add("new@example.com", NOW)).rejects.toThrow();
    expect(await readFile(file, "utf8")).toBe("{ corrupt but precious");
  });

  it("recovers after a failed write (the queue is not jammed)", async () => {
    const file = await tmp();
    const store = new FileSubscriberStore(file);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, "garbage");
    await expect(store.add("a@example.com", NOW)).rejects.toThrow();
    await writeFile(file, JSON.stringify({ subscribers: [] }));
    expect(await store.add("a@example.com", NOW)).toBe("added");
  });
});
