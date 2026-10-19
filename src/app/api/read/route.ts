import { handleReadRequest } from "@/server/read-handler";
import { getAllArticles } from "@/server/articles";
import { readStore } from "@/server/reads";

export async function POST(request: Request) {
  return handleReadRequest(request, {
    knownSlugs: async () => new Set((await getAllArticles()).map((a) => a.slug)),
    record: (slug, ip, userAgent) => readStore.record(slug, ip, userAgent),
  });
}
