"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/ui/icons";

/**
 * Client Component: needs `navigator.share` / clipboard, which only exist in the browser.
 * Progressive enhancement — before hydration it is an inert button, and nothing depends on it.
 */
export function ShareButton({ url, title, iconOnly = false }: { url: string; title: string; iconOnly?: boolean }) {
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
      aria-label={iconOnly ? (status === "copied" ? "Link copied" : status === "failed" ? "Couldn't share" : "Share this article") : undefined}
      title={iconOnly ? "Share" : undefined}
      className={
        iconOnly
          ? "grid size-9 place-items-center rounded-control text-ink-muted hover:bg-canvas hover:text-ink"
          : "inline-flex items-center gap-1.5 rounded-control border border-line bg-surface px-3 py-1.5 text-small font-medium text-ink hover:border-line-strong"
      }
    >
      <ShareIcon className={iconOnly ? "size-5" : undefined} />
      {iconOnly ? (status !== "idle" ? <span className="sr-only" role="status">{status === "copied" ? "Link copied" : "Couldn't share"}</span> : null) : status === "copied" ? "Link copied" : status === "failed" ? "Couldn't share" : "Share"}
    </button>
  );
}
