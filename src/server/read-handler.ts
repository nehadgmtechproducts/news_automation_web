import "server-only";
import { isBot } from "@/core/reads";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BODY_BYTES = 1024;

export type ReadDeps = {
  knownSlugs(): Promise<ReadonlySet<string>>;
  record(slug: string, ip: string, userAgent: string): Promise<boolean>;
};

const status = (code: number) => new Response(null, { status: code });

/**
 * POST /api/read  {"slug": "..."}  — the browser calls this after a reader has stayed on an
 * article. Every refusal is deliberate:
 *   - cross-origin requests are refused (another site can't pump our numbers from its visitors);
 *   - crawlers, link-preview fetchers and scripts are ignored (their user agent gives them away);
 *   - only slugs of articles that really exist are counted (no junk keys);
 *   - the body is tiny and strictly validated.
 * A valid request always gets 204 whether or not it counted, so the endpoint reveals nothing.
 */
export async function handleReadRequest(req: Request, deps: ReadDeps): Promise<Response> {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return status(403);
    } catch {
      return status(403);
    }
  }

  const userAgent = req.headers.get("user-agent");
  if (isBot(userAgent)) return status(204);

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return status(413);

  let slug: unknown;
  try {
    slug = (JSON.parse(text) as { slug?: unknown }).slug;
  } catch {
    return status(400);
  }
  if (typeof slug !== "string" || slug.length > 160 || !SLUG.test(slug)) return status(400);
  if (!(await deps.knownSlugs()).has(slug)) return status(404);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  await deps.record(slug, ip, userAgent ?? "");
  return status(204);
}
