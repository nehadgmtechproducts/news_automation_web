import "server-only";
import { z } from "zod";

/**
 * Environment is validated once, at import time, so a bad deploy fails loudly at
 * build/start instead of producing wrong canonical URLs in production.
 *
 * SITE_URL is the public origin (no path). It feeds canonical links, Open Graph URLs,
 * the sitemap and structured data — get it wrong and search engines index the wrong host.
 */
const schema = z.object({
  SITE_URL: z.url().default("http://localhost:3000"),
});

const parsed = schema.safeParse({ SITE_URL: process.env.SITE_URL || undefined });
if (!parsed.success) {
  throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);
}

// SITE_URL is baked into statically generated pages at BUILD time. Forgetting it in a
// production build would ship canonical/OG URLs pointing at localhost — warn loudly.
if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  console.warn("[config] SITE_URL is not set: canonical, Open Graph and sitemap URLs will point at http://localhost:3000");
}

export const siteUrl = new URL(parsed.data.SITE_URL).origin;

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
