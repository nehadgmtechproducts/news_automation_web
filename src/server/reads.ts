import "server-only";
import { readsFile } from "@/config/env";
import type { Article } from "@/core/article";
import { pickMostRead } from "@/core/reads";
import { FileReadStore } from "./read-store";

/** Composition root for read counting: the one place that picks a concrete store. */
export const readStore = new FileReadStore(readsFile);

/** Stories for "Most read today" (see core/reads.ts). Empty until something has been read. */
export async function getMostRead(articles: Article[], limit = 5): Promise<Article[]> {
  return pickMostRead(await readStore.load(), articles, new Date(), limit);
}
