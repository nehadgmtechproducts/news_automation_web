import type { Article } from "./article";

/**
 * Anonymous read counting behind "Most read today". Pure functions over a plain state object, so
 * every rule here is unit-tested without a server, a clock or a file.
 *
 * Privacy by design: no cookies, no IP addresses stored. A visitor is only ever a short hash of
 * (that day's random salt + IP + browser string). The salt is deleted with the rest of that day's
 * data after two days, after which the hashes can no longer be linked to anyone. The hash exists
 * for one purpose: counting one visitor once per article per day.
 */
export type ReadsState = {
  /** UTC hour ("2026-10-07T09") -> article slug -> number of reads. */
  hours: Record<string, Record<string, number>>;
  /** UTC day -> random salt used to hash that day's visitors. */
  salts: Record<string, string>;
  /** UTC day -> "slug:visitorHash" pairs already counted that day. */
  seen: Record<string, string[]>;
};

export const emptyReads = (): ReadsState => ({ hours: {}, salts: {}, seen: {} });

/** "Today" is a rolling window, not a calendar day: 9am looks back to 9am yesterday. */
export const WINDOW_HOURS = 24;
/** Data older than this is deleted. Two days covers the window plus the salt's lifetime. */
const KEEP_HOURS = 48;

export const hourKey = (d: Date) => d.toISOString().slice(0, 13);
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|httpclient|axios|node-fetch/i;

/** Crawlers, link-preview fetchers and scripts must not inflate a popularity ranking. */
export function isBot(userAgent: string | null | undefined): boolean {
  return !userAgent || BOT.test(userAgent);   // no user agent at all is not a browser either
}

/**
 * Count one read, unless this visitor already read this article today.
 * Returns the new state and whether it counted. Never mutates its input.
 */
export function recordRead(state: ReadsState, slug: string, visitorHash: string, now: Date): { state: ReadsState; counted: boolean } {
  const day = dayKey(now);
  const pair = `${slug}:${visitorHash}`;
  if (state.seen[day]?.includes(pair)) return { state, counted: false };

  const hour = hourKey(now);
  return {
    counted: true,
    state: {
      salts: state.salts,
      seen: { ...state.seen, [day]: [...(state.seen[day] ?? []), pair] },
      hours: { ...state.hours, [hour]: { ...state.hours[hour], [slug]: (state.hours[hour]?.[slug] ?? 0) + 1 } },
    },
  };
}

/** Drop everything older than KEEP_HOURS: old counts, old dedupe lists and — importantly — old salts. */
export function prune(state: ReadsState, now: Date): ReadsState {
  const cutoff = new Date(now.getTime() - KEEP_HOURS * 3_600_000);
  const cutoffHour = hourKey(cutoff);
  const cutoffDay = dayKey(cutoff);
  const keepDay = <T,>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([d]) => d >= cutoffDay));
  return {
    hours: Object.fromEntries(Object.entries(state.hours).filter(([h]) => h >= cutoffHour)),
    salts: keepDay(state.salts),
    seen: keepDay(state.seen),
  };
}

/** Slugs ranked by reads in the last WINDOW_HOURS, most first (ties: slug order, for stable output). */
export function mostRead(state: ReadsState, now: Date, limit = 10): { slug: string; reads: number }[] {
  const from = hourKey(new Date(now.getTime() - WINDOW_HOURS * 3_600_000));
  const to = hourKey(now);
  const totals = new Map<string, number>();
  for (const [hour, bySlug] of Object.entries(state.hours)) {
    if (hour < from || hour > to) continue;
    for (const [slug, n] of Object.entries(bySlug)) totals.set(slug, (totals.get(slug) ?? 0) + n);
  }
  return [...totals]
    .map(([slug, reads]) => ({ slug, reads }))
    .filter((r) => r.reads > 0)
    .sort((a, b) => b.reads - a.reads || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}

/**
 * The articles to show under "Most read today": only stories with reads in the window, most-read
 * first, restricted to the articles given (so an edition page ranks only its own stories) and cut
 * to `limit`. Empty when nothing has been read: the list is never padded with unread stories, so
 * the title can never claim more than the data supports.
 */
export function pickMostRead(state: ReadsState, articles: Article[], now: Date, limit = 5): Article[] {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  return mostRead(state, now, articles.length || 1)
    .map((r) => bySlug.get(r.slug))
    .filter((a): a is Article => !!a)
    .slice(0, limit);
}
