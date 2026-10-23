import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * scripts/publish-content.sh against real throwaway git repos: a bare "remote" standing in for GitHub,
 * and a working clone the script runs in. No network, nothing of the real repo is touched.
 */
const SCRIPT = path.join(process.cwd(), "scripts", "publish-content.sh");

let root: string, remote: string, work: string;
const git = (cwd: string, ...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const run = (env: Record<string, string> = {}) =>
  spawnSync("bash", [SCRIPT], { cwd: work, encoding: "utf8", env: { ...process.env, REPO_DIR: work, SETTLE_SECONDS: "0", ...env } });
const write = (rel: string, body = "x") => {
  const f = path.join(work, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, body);
};
const story = (slug: string, title: string) => {
  write(`public/media/${slug}/cover-aaaa1111.jpg`, "img");
  write(`content/articles/${slug}.json`, `{\n  "slug": "${slug}",\n  "title": "${title}",\n  "category": "Healthcare"\n}\n`);
};
const commitsOnRemote = () => Number(git(remote, "rev-list", "--count", "main"));

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "publish-content-"));
  remote = path.join(root, "remote.git");
  work = path.join(root, "work");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", remote]);
  execFileSync("git", ["clone", "-q", remote, work]);
  git(work, "config", "user.name", "Test");
  git(work, "config", "user.email", "test@example.com");
  git(work, "checkout", "-q", "-b", "main");
  write("README.md", "hello");
  write("src/code.ts", "export {}");
  git(work, "add", "-A");
  git(work, "commit", "-q", "-m", "initial");
  git(work, "push", "-q", "-u", "origin", "main");
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("publish-content.sh", () => {
  it("does nothing when there is nothing new", () => {
    const r = run();
    expect(r.status).toBe(0);
    expect(commitsOnRemote()).toBe(1);
  });

  it("commits and pushes a new story, with its headline in the message", () => {
    story("first-case", "First case detected in France");
    const r = run();
    expect(r.status, r.stderr).toBe(0);
    expect(commitsOnRemote()).toBe(2);
    const message = git(remote, "log", "-1", "--format=%B", "main");
    expect(message).toContain("Publish 1 story");
    expect(message).toContain("- First case detected in France");
    expect(git(remote, "show", "--stat", "--format=", "main")).toMatch(/content\/articles\/first-case\.json[\s\S]*cover-aaaa1111\.jpg/);
    expect(git(work, "status", "--porcelain")).toBe("");
  });

  it("publishes several stories in one commit", () => {
    story("one", "Story one");
    story("two", "Story two");
    run();
    expect(commitsOnRemote()).toBe(2);
    const message = git(remote, "log", "-1", "--format=%B", "main");
    expect(message).toContain("Publish 2 stories");
    expect(message).toContain("- Story one");
    expect(message).toContain("- Story two");
  });

  it("never commits anything but stories: unrelated edits, new files and staged changes are left alone", () => {
    story("a-story", "A story");
    write("src/code.ts", "export const changed = 1;");   // modified, unstaged
    write("src/new.ts", "new");                           // untracked
    write("README.md", "edited and staged");
    git(work, "add", "README.md");                        // staged
    run();
    const files = git(remote, "show", "--name-only", "--format=", "main").split("\n");
    expect(files.every((f) => f.startsWith("content/articles/") || f.startsWith("public/media/"))).toBe(true);
    expect(git(work, "status", "--porcelain")).toContain("M  README.md");   // still staged, not committed
    expect(git(work, "status", "--porcelain")).toContain(" M src/code.ts");
    expect(git(work, "status", "--porcelain")).toContain("?? src/new.ts");
  });

  it("records a deleted story", () => {
    story("old-one", "Old story");
    run();
    rmSync(path.join(work, "content/articles/old-one.json"));
    rmSync(path.join(work, "public/media/old-one"), { recursive: true });
    run();
    expect(commitsOnRemote()).toBe(3);
    expect(git(remote, "log", "-1", "--format=%B", "main")).toContain("- removed: old-one");
    expect(existsSync(path.join(work, "content/articles/old-one.json"))).toBe(false);
  });

  it("skips when not on the publish branch", () => {
    git(work, "checkout", "-q", "-b", "feature");
    story("x", "X");
    const r = run();
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("not 'main'");
    expect(commitsOnRemote()).toBe(1);
    expect(git(work, "status", "--porcelain")).toContain("?? content/");   // left untouched
  });

  it("when the remote has moved on, rebases its commit on top and still pushes", () => {
    const other = path.join(root, "other");
    execFileSync("git", ["clone", "-q", remote, other]);
    git(other, "config", "user.name", "Dev"); git(other, "config", "user.email", "dev@example.com");
    writeFileSync(path.join(other, "src/code.ts"), "export const fromSomeoneElse = 1;");
    git(other, "commit", "-q", "-am", "code change"); git(other, "push", "-q", "origin", "main");

    story("late", "Late story");
    const r = run();
    expect(r.status, r.stderr).toBe(0);
    expect(commitsOnRemote()).toBe(3);                        // initial + their code + our story
    const files = git(remote, "show", "--name-only", "--format=", "main");
    expect(files).toContain("content/articles/late.json");
    expect(git(work, "show", "HEAD~1:src/code.ts")).toContain("fromSomeoneElse");
  });

  it("leaves a half-written story for the next run instead of committing it", () => {
    story("busy", "Busy story");
    // a writer that keeps changing a file while the script waits
    const writer = spawnSync("bash", ["-c", `(sleep 0.3; echo more >> "${work}/public/media/busy/cover-aaaa1111.jpg") & bash "${SCRIPT}"; wait`], {
      cwd: work, encoding: "utf8", env: { ...process.env, REPO_DIR: work, SETTLE_SECONDS: "1" },
    });
    expect(writer.stdout).toContain("still being written");
    expect(commitsOnRemote()).toBe(1);
    run();                                                    // a later run, with the files quiet, publishes it
    expect(commitsOnRemote()).toBe(2);
  });

  it("two overlapping runs do not both commit (a lock is held)", () => {
    story("locked", "Locked story");
    mkdirSync(path.join(work, ".git", "publish-content.lock"));
    const r = run();
    expect(r.stdout).toContain("another run is in progress");
    expect(commitsOnRemote()).toBe(1);
  });
});
