"use client";

import { useState } from "react";
import type { NavItem } from "@/config/site";
import { SearchForm } from "@/components/search/SearchForm";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { NavLinks } from "./NavLinks";

/**
 * Client Component — the open/closed state is the only reason. It receives plain data as props
 * from the server-rendered Header, and the panel's links exist in the server HTML even while it
 * is visually hidden, so crawlers still see them.
 */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-control border border-line text-ink"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>
      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-surface px-4 pb-4 pt-3 shadow-lift sm:px-6"
      >
        <SearchForm id="mobile-search" className="mb-3 md:hidden" />
        <NavLinks items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
      </nav>
    </div>
  );
}
