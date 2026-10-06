"use client";

import { useState } from "react";

/**
 * Client Component: needs `navigator.share` / clipboard, which only exist in the browser.
 * Progressive enhancement — before hydration it is an inert button, and nothing on the
 * page depends on it.
 */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return; // user closed the share sheet
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-background"
    >
      {status === "copied" ? "Link copied" : status === "failed" ? "Couldn't share" : "Share"}
    </button>
  );
}
