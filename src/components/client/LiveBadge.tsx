"use client";

import { useSyncExternalStore } from "react";
import { isLive } from "@/core/stories";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * "● Live" while a story with several updates has a recent one. Client Component because "recent"
 * depends on the visitor's clock; the server renders NOTHING (so a cached page can never claim a
 * story is live hours after it went quiet) and the badge appears after hydration.
 */
export function LiveBadge({ story }: { story: { lastUpdatedAt: string; updates: readonly unknown[] } }) {
  const live = useSyncExternalStore(subscribe, () => isLive(story, Date.now()), () => false);
  if (!live) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-label uppercase text-live">
      <span className="size-2 rounded-full bg-live" aria-hidden /> Live
    </span>
  );
}
