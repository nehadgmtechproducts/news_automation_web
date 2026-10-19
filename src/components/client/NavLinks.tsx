"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The only reason this is a Client Component is usePathname(), to mark the current page.
 * The links themselves are in the server HTML, so crawlers and no-JS visitors still get them.
 */
export function NavLinks({
  items,
  orientation = "horizontal",
  onNavigate,
}: {
  items: readonly NavItem[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <ul className={cn("flex", orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1")}>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-control px-3 py-2 text-small font-medium transition-colors",
                active ? "bg-brand-soft text-brand" : "text-ink-muted hover:bg-canvas hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
