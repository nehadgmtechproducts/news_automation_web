import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const fileSchema = z.object({
  subscribers: z.array(z.object({ email: z.string(), subscribedAt: z.string(), source: z.string() })),
});
type FileState = z.infer<typeof fileSchema>;

/**
 * Newsletter addresses in one small JSON file (git-ignored). Same approach as the read counter:
 * serialised writes, atomic saves, tolerant of a missing file. A CORRUPT file is different: it
 * holds people's addresses, so it is never silently overwritten; the sign-up errors out instead
 * and the file is left for a human to inspect.
 *
 * Only fits ONE server process with a persistent disk. For serverless or several servers, write
 * another store with the same `add` method (database) and change one line in subscribers.ts.
 */
export class FileSubscriberStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly file: string) {}

  async list(): Promise<FileState["subscribers"]> {
    return (await this.load()).subscribers;
  }

  /** Adds an address (already validated and lower-cased). "exists" if it was already there. */
  add(email: string, now: Date, source = "home"): Promise<"added" | "exists"> {
    const run = async () => {
      const state = await this.load();
      if (state.subscribers.some((s) => s.email === email)) return "exists" as const;
      state.subscribers.push({ email, subscribedAt: now.toISOString(), source });
      await this.save(state);
      return "added" as const;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);   // one failure must not jam later sign-ups
    return result;
  }

  private async load(): Promise<FileState> {
    let text: string;
    try {
      text = await readFile(this.file, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return { subscribers: [] };
      throw err;
    }
    return fileSchema.parse(JSON.parse(text));     // throws on corruption: see the class comment
  }

  private async save(state: FileState): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(state, null, 2), { encoding: "utf8", mode: 0o600 });
    await rename(tmp, this.file);
  }
}
