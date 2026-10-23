"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LiveBadge } from "@/components/client/LiveBadge";
import { TimeAgo } from "@/components/client/TimeAgo";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { CategoryName } from "@/core/categories";
import { formatDate } from "@/core/format";
import { scrollEdges } from "@/core/scroll";
import { storyTabs, type StorySummary } from "@/core/stories";
import { cn } from "@/lib/cn";
import { StoryTimeline } from "./StoryTimeline";

type Tab = "all" | CategoryName;

/** The round "scroll the tabs" button, one component for both directions. */
function TabArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Show earlier topics" : "Show more topics"}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-muted hover:border-line-strong hover:text-ink"
    >
      {direction === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
}

/**
 * "Developing stories": ongoing stories with their timelines, filterable by category.
 *
 * Client Component for one reason: the category tabs hold state. Every story's timeline is still
 * in the server-rendered HTML (native <details>, no JavaScript needed to expand), and the default
 * tab shows all of them, so crawlers see the full content.
 */
export function DevelopingStories({
  stories,
  onSelect,
}: {
  stories: StorySummary[];
  /** Told which story is open (null = none), so the lead card beside the panel can follow it. */
  onSelect?: (key: string | null) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  // One story open at a time. The first starts open, exactly as the server-rendered HTML shows it.
  const [openKey, setOpenKey] = useState<string | null>(stories[0]?.key ?? null);
  const select = (key: string | null) => {
    setOpenKey(key);
    onSelect?.(key);
  };

  // Six tabs don't fit the narrow panel: show an arrow on each side while tabs are hidden there.
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => {
      const next = scrollEdges(el.scrollLeft, el.clientWidth, el.scrollWidth);
      setEdges((prev) => (prev.left === next.left && prev.right === next.right ? prev : next));
    };
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const scrollTabs = (direction: -1 | 1) => row.current?.scrollBy({ left: direction * 160, behavior: "smooth" });

  const tabs = storyTabs(stories);      // "All stories" + EVERY category, with 0 where there is none
  const visible = tab === "all" ? stories : stories.filter((s) => s.category === tab);

  return (
    // On wide screens the panel fills the box its parent reserves for it (absolute + inset-0) and scrolls
    // inside it. It must NOT size itself: otherwise opening a timeline makes the row taller and the lead
    // story's cover stretches with it (see HomeContent).
    <Panel className="flex flex-col lg:absolute lg:inset-0 lg:overflow-y-auto">
      <SectionHeading title="Developing stories" href="/stories" />

      {stories.length === 0 ? (
        <p className="mt-4 text-small text-ink-muted">
          No developing stories yet. A story appears here as soon as a report is published.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-2">
            {edges.left && <TabArrow direction="left" onClick={() => scrollTabs(-1)} />}
            <div
              ref={row}
              role="tablist"
              aria-label="Filter stories by topic"
              className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => {
                    setTab(t.id);
                    // the new tab's first story opens, like on first load
                    select((t.id === "all" ? stories : stories.filter((s) => s.category === t.id))[0]?.key ?? null);
                  }}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-caption font-medium transition-colors",
                    tab === t.id
                      ? "border-brand bg-brand text-ink-inverse"
                      : "border-line bg-surface hover:border-line-strong hover:text-ink",
                    tab !== t.id && (t.count === 0 ? "text-ink-subtle" : "text-ink-muted"),
                  )}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
            {edges.right && <TabArrow direction="right" onClick={() => scrollTabs(1)} />}
          </div>

          <div role="tabpanel" className="mt-3 flex-1 divide-y divide-line">
            {visible.length === 0 && (
              <p className="py-6 text-small text-ink-muted">
                No developing {tab} stories yet. A story appears here as soon as one is published.
              </p>
            )}
            {visible.map((story) => (
              <details key={`${tab}-${story.key}`} className="group py-3" open={openKey === story.key}>
                <summary
                  onClick={(e) => {
                    e.preventDefault();               // we own the open state, so the card beside us can follow it
                    select(openKey === story.key ? null : story.key);
                  }}
                  className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden"
                >
                  <span className="relative mt-0.5 h-12 w-16 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
                    <Image src={story.coverSrc} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <LiveBadge story={{ lastUpdatedAt: story.lastUpdatedAt, updates: Array(story.updateCount).fill(null) }} />
                    <span className="block text-small font-semibold text-ink">{story.label}</span>
                    <span className="block text-caption text-ink-subtle">
                      {story.updateCount} {story.updateCount === 1 ? "update" : "updates"} · Last update{" "}
                      <TimeAgo iso={story.lastUpdatedAt} fallback={formatDate(story.lastUpdatedAt)} />
                    </span>
                  </span>
                  <ChevronDownIcon className="mt-1 size-5 text-ink-subtle transition-transform group-open:rotate-180" />   {/* points down when closed, up when open */}
                </summary>

                <div className="mt-4 pl-1">
                  <StoryTimeline items={story.updates} />
                  <Link
                    href={story.href}
                    className="mt-4 flex items-center justify-center gap-1 rounded-control bg-brand-soft py-2 text-small font-semibold text-brand hover:text-brand-strong"
                  >
                    {story.updateCount >= 2 ? "View full timeline" : "Read the story"} <ArrowRightIcon />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
