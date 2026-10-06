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
