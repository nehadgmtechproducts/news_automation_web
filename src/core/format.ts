import { plainText } from "./markdown";
import type { Article } from "./article";

const WORDS_PER_MINUTE = 220;

export function readingMinutes(article: Pick<Article, "sections" | "keyTakeaways" | "whyItMatters">): number {
  const text = [
    ...article.sections.map((s) => plainText(s.body)),
    ...article.keyTakeaways,
    article.whyItMatters,
  ].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** 42.77 -> "0:43" — for the on-card duration badge. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** 42.77 -> "PT43S" — the ISO 8601 form search engines expect for video duration. */
export function toIsoDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `PT${m ? `${m}M` : ""}${rest || !m ? `${rest}S` : ""}`;
}

/**
 * Always formatted in UTC. A date that depends on the server's or visitor's timezone can
 * render differently on the server and in the browser, which causes hydration mismatches.
 */
export function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
}

/**
 * "10 min ago" style label. Pure: pass `nowMs` in, never read the clock here, so the result is
 * testable and the server and browser can't disagree. Beyond a week it falls back to a date.
 */
export function relativeTime(iso: string, nowMs: number): string {
  const diffMin = Math.floor((nowMs - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatDate(iso);
}

/** "09:12 UTC". UTC on purpose: the server and every visitor's browser then print the same text. */
export function formatTimeUtc(iso: string): string {
  return `${new Date(iso).toISOString().slice(11, 16)} UTC`;
}
