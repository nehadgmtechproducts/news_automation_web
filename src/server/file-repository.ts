import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { articleSchema, type Article } from "@/core/article";
import type { ArticleRepository } from "./repository";
import * as z from "zod";

/**
 * Reads `content/articles/*.json`, validating every file against the contract.
 *
 * A malformed file is a publishing bug, not a reason to take the whole site down: it is
 * skipped and reported loudly (build log), so one bad article never blanks the homepage.
 */
export class FileArticleRepository implements ArticleRepository {
  constructor(private readonly dir: string = path.join(process.cwd(), "content", "articles")) {}

  async list(): Promise<Article[]> {
    let files: string[];
    try {
      files = (await readdir(this.dir)).filter((f) => f.endsWith(".json"));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }

    const loaded = await Promise.all(files.map((f) => this.load(path.join(this.dir, f))));
    return loaded
      .filter((a): a is Article => a !== null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async bySlug(slug: string): Promise<Article | null> {
    return (await this.list()).find((a) => a.slug === slug) ?? null;
  }

  private async load(file: string): Promise<Article | null> {
    try {
      const parsed = articleSchema.safeParse(JSON.parse(await readFile(file, "utf8")));
      if (parsed.success) return parsed.data;
      console.error(`[content] skipped ${path.basename(file)}:\n${z.prettifyError(parsed.error)}`);
    } catch (err) {
      console.error(`[content] skipped ${path.basename(file)}: ${(err as Error).message}`);
    }
    return null;
  }
}
