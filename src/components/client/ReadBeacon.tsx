"use client";

import { useEffect } from "react";

/** A reader must stay this long, with the tab in front, before a read counts. */
const DWELL_MS = 5000;

/**
 * Tells the server "this article was read", feeding "Most read today". Renders nothing.
 * Client Component because only a browser can know someone actually stayed. A page opened and
 * closed within a few seconds, or left in a background tab, is not a read.
 */
export function ReadBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      const body = JSON.stringify({ slug });
      if (!navigator.sendBeacon?.("/api/read", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/read", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
      }
    }, DWELL_MS);
    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
