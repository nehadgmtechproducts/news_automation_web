"use client";

import { useEffect, useRef, useState } from "react";
import type { OutlineItem } from "@/core/outline";
import { pickActiveId } from "@/core/scrollspy";
import { cn } from "@/lib/cn";

/**
 * A heading becomes current once it is above this line. Headings land at the global
 * `scroll-padding-top` (styles/base.css, 88px) when linked to, so the line must sit BELOW that,
 * or the item just clicked would never count as reached. Keep a single offset: do not add
 * scroll-mt-* classes to headings.
 */
const ACTIVATION_LINE = 140;
/** After a click, ignore scroll events while the page glides to the heading. */
const CLICK_LOCK_MS = 900;

/**
 * "On this article" with a scroll-spy highlight. Client Component only for the scroll listener;
 * the anchor links are in the server HTML and work without JavaScript.
 */
export function OutlineNav({ items }: { items: OutlineItem[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);
  const lockedUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    let timer = 0;

    const update = () => {
      frame = 0;
      const wait = lockedUntil.current - Date.now();
      if (wait > 0) {
        // A click is still scrolling: look again once it has settled, so the highlight can't
        // be left on a stale item when the last scroll event fell inside the lock window.
        timer = window.setTimeout(onScroll, wait + 30);
        return;
      }
      const tops = items.map((item) => ({
        id: item.id,
        top: document.getElementById(item.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      }));
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActiveId(pickActiveId(tops, ACTIVATION_LINE, atBottom));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update); // initial position, e.g. when opened at #sources
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label="On this article">
      <p className="mb-4 text-small font-semibold text-ink">On this article</p>
      {/* a vertical line with one dot per section; the current section's dot and text are blue */}
      <ol className="relative space-y-3.5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id} className="relative pl-6">
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-[0.3rem] size-[11px] rounded-full border-2 transition-colors",
                  active ? "border-brand bg-brand" : "border-line-strong bg-surface",
                )}
              />
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  setActiveId(item.id);
                  lockedUntil.current = Date.now() + CLICK_LOCK_MS;
                }}
                className={cn("block text-small transition-colors", active ? "font-medium text-brand" : "text-ink-muted hover:text-ink")}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
