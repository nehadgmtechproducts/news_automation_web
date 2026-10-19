import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { dayKey, emptyReads, prune, recordRead, type ReadsState } from "@/core/reads";

const stateSchema = z.object({
  hours: z.record(z.string(), z.record(z.string(), z.number())),
  salts: z.record(z.string(), z.string()),
  seen: z.record(z.string(), z.array(z.string())),
});

/**
 * Read counts in one small JSON file.
 *
 *  - Writes are serialised through a promise queue, so two reads arriving together can't overwrite
 *    each other, and each save is write-to-temp-then-rename, so a crash never leaves half a file.
 *  - A missing or corrupt file means "no reads yet", never an error: this is a convenience ranking,
 *    and it must not be able to take a page down.
 *  - Only fits ONE server process with a persistent disk. For serverless or several servers, write
 *    another store with the same two methods (database, Redis) and change one line in reads.ts.
 */
export class FileReadStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly file: string) {}

  async load(): Promise<ReadsState> {
    try {
      return stateSchema.parse(JSON.parse(await readFile(this.file, "utf8")));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`[reads] ${path.basename(this.file)} unreadable, starting fresh: ${(err as Error).message}`);
      }
      return emptyReads();
    }
  }

  /** Count a read. Resolves to whether it counted (false = this visitor already read it today). */
  record(slug: string, ip: string, userAgent: string, now: Date = new Date()): Promise<boolean> {
    const run = async () => {
      let state = prune(await this.load(), now);
      const day = dayKey(now);
      const salt = state.salts[day] ?? randomBytes(16).toString("hex");
      state = { ...state, salts: { ...state.salts, [day]: salt } };
      const visitor = createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 16);

      const { state: next, counted } = recordRead(state, slug, visitor, now);
      await this.save(next);
      return counted;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);   // one failed write must not jam the queue
    return result;
  }

  private async save(state: ReadsState): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(state), "utf8");
    await rename(tmp, this.file);
  }
}
