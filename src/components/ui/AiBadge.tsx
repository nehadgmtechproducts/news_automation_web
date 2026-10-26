import { cn } from "@/lib/cn";

const SIZES = {
  /** big pictures: the lead story, a story page header, the article's main image ("AI-generated illustration" from tablet width) */
  full: { text: "AI-generated", tail: " illustration", className: "right-3 top-3 px-2.5 py-1 text-caption" },
  /** card thumbnails */
  short: { text: "AI-generated", tail: "", className: "right-2 top-2 px-1.5 py-0.5 text-micro" },
  /** tiny thumbnails (rows, side lists) */
  mini: { text: "AI", tail: "", className: "right-1 top-1 px-1 py-px text-[0.5625rem] leading-none" },
} as const;

/**
 * A visible label ON the picture for an AI-generated illustration. Place it inside the image's `relative`
 * container. The text is what a reader sees; the title spells it out for hover and assistive technology.
 * It ignores the pointer, so cards stay fully clickable.
 */
export function AiBadge({ size = "short", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span
      title="Illustration generated with AI"
      data-ai-badge=""
      className={cn("pointer-events-none absolute z-10 rounded-control bg-black/70 font-semibold uppercase tracking-wide text-white backdrop-blur-sm", s.className, className)}
    >
      {s.text}
      {/* the longer wording only where there is room: on a 320px phone it would run into the category tag */}
      {s.tail && <span className="hidden sm:inline">{s.tail}</span>}
    </span>
  );
}
