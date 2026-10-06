"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavItem } from "@/config/site";

/**
 * Client Component — the ONLY reason it is one is the open/closed state.
 * It receives plain data as props from the server-rendered Header, so the links still
 * exist in the server HTML for crawlers; hydration just adds the toggle.
 */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-line px-3 py-1.5 text-sm font-medium"
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-surface px-4 py-3"
      >
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setOpen(false)} className="block py-2 font-medium">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
