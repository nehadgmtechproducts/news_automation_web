import "server-only";
import path from "node:path";
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
  /** Where anonymous read counts are kept (see server/read-store.ts). */
  READS_FILE: z.string().min(1).default(".data/reads.json"),
  /** Where newsletter sign-ups are kept (see server/subscriber-store.ts). */
  SUBSCRIBERS_FILE: z.string().min(1).default(".data/subscribers.json"),
  /** How readers reach us (corrections, privacy requests). The footer's "Contact Us" appears only when set. */
  /** Show videos on the site (player, Watch page and links, duration badges). Off by default: articles are text + images. */
  SHOW_VIDEOS: z.enum(["true", "false"]).default("false"),
  CONTACT_EMAIL: z.email().optional(),
  /** The Resident Grievance Officer the IT Rules 2021 require a news publisher to name (see /legal-compliance). */
  GRIEVANCE_OFFICER_NAME: z.string().trim().min(1).optional(),
  GRIEVANCE_OFFICER_EMAIL: z.email().optional(),
  GRIEVANCE_OFFICER_ADDRESS: z.string().trim().min(1).optional(),
  /** Real profile URLs. The footer shows an icon only for the ones that are set: never a link to nowhere. */
  SOCIAL_INSTAGRAM: z.url().optional(),
  SOCIAL_YOUTUBE: z.url().optional(),
  SOCIAL_LINKEDIN: z.url().optional(),
  SOCIAL_X: z.url().optional(),
});

const parsed = schema.safeParse({
  SITE_URL: process.env.SITE_URL || undefined,
  READS_FILE: process.env.READS_FILE || undefined,
  SUBSCRIBERS_FILE: process.env.SUBSCRIBERS_FILE || undefined,
  SHOW_VIDEOS: process.env.SHOW_VIDEOS || undefined,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || undefined,
  GRIEVANCE_OFFICER_NAME: process.env.GRIEVANCE_OFFICER_NAME || undefined,
  GRIEVANCE_OFFICER_EMAIL: process.env.GRIEVANCE_OFFICER_EMAIL || undefined,
  GRIEVANCE_OFFICER_ADDRESS: process.env.GRIEVANCE_OFFICER_ADDRESS || undefined,
  SOCIAL_INSTAGRAM: process.env.SOCIAL_INSTAGRAM || undefined,
  SOCIAL_YOUTUBE: process.env.SOCIAL_YOUTUBE || undefined,
  SOCIAL_LINKEDIN: process.env.SOCIAL_LINKEDIN || undefined,
  SOCIAL_X: process.env.SOCIAL_X || undefined,
});
if (!parsed.success) {
  throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);
}

// SITE_URL is baked into statically generated pages at BUILD time. Forgetting it in a
// production build would ship canonical/OG URLs pointing at localhost — warn loudly.
if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  console.warn("[config] SITE_URL is not set: canonical, Open Graph and sitemap URLs will point at http://localhost:3000");
}

export const siteUrl = new URL(parsed.data.SITE_URL).origin;
export const readsFile = path.resolve(process.cwd(), parsed.data.READS_FILE);
export const subscribersFile = path.resolve(process.cwd(), parsed.data.SUBSCRIBERS_FILE);

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export const showVideos = parsed.data.SHOW_VIDEOS === "true";
export const contactEmail = parsed.data.CONTACT_EMAIL;

// The privacy policy promises readers a way to ask for their data to be removed, and the corrections
// policy a way to report mistakes. Both need a real address before launch.
if (process.env.NODE_ENV === "production" && !contactEmail) {
  console.warn("[config] CONTACT_EMAIL is not set: readers have no way to request corrections or data removal.");
}

/** Shown on /legal-compliance only when a real person is configured: never a placeholder, never an invented name. */
export const grievanceOfficer =
  parsed.data.GRIEVANCE_OFFICER_NAME && parsed.data.GRIEVANCE_OFFICER_EMAIL
    ? { name: parsed.data.GRIEVANCE_OFFICER_NAME, email: parsed.data.GRIEVANCE_OFFICER_EMAIL, address: parsed.data.GRIEVANCE_OFFICER_ADDRESS }
    : undefined;
if (process.env.NODE_ENV === "production" && !grievanceOfficer) {
  console.warn("[config] GRIEVANCE_OFFICER_NAME / GRIEVANCE_OFFICER_EMAIL are not set: /legal-compliance has no Grievance Officer to name, which the IT Rules require of a news publisher.");
}

export const socialUrls = {
  instagram: parsed.data.SOCIAL_INSTAGRAM,
  youtube: parsed.data.SOCIAL_YOUTUBE,
  linkedin: parsed.data.SOCIAL_LINKEDIN,
  x: parsed.data.SOCIAL_X,
} as const;
