"use client";

import { useSyncExternalStore } from "react";
import { relativeTime } from "@/core/format";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * "10 min ago", kept current in the browser.
 *
 * Client Component because "now" only exists in the visitor's browser. The server renders the
 * absolute date (`fallback`) into the HTML — that is what crawlers and no-JS readers see, and it
 * never goes stale inside a cached page. After hydration the label becomes relative and ticks
 * once a minute. useSyncExternalStore gives the server and first client render the SAME
 * snapshot, so there is no hydration mismatch.
 */
export function TimeAgo({ iso, fallback }: { iso: string; fallback: string }) {
  const text = useSyncExternalStore(subscribe, () => relativeTime(iso, Date.now()), () => fallback);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {text}
    </time>
  );
}
