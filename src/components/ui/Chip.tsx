import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Pill-shaped filter link (a real link, so filtering works without JavaScript and is crawlable).
 * `on="canvas"` is a white outlined pill for the page background; `on="panel"` is the light
 * grey-blue filled pill used inside a white card (the Latest news filters in the design).
 */
export function Chip({
  href,
  active = false,
  on = "canvas",
  children,
}: {
  href: string;
  active?: boolean;
  on?: "canvas" | "panel";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-small font-medium transition-colors",
        active
          ? "border-brand bg-brand text-ink-inverse"
          : on === "panel"
            ? "border-transparent bg-canvas text-ink-muted hover:bg-surface-sunken hover:text-ink"
            : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
