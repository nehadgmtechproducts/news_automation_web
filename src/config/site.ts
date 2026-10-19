import { CATEGORIES } from "@/core/categories";

/**
 * Static site identity. Pure constants — safe to import anywhere (server or client).
 * Change the brand here and every title, feed, and structured-data block follows.
 */
export const siteConfig = {
  name: "The Brief",
  tagline: "Clear stories. A brighter tomorrow.",
  description:
    "Sourced news on technology, politics, finance, entertainment and new launches, Every story lists the independent outlets it was written from.",
  /** Footer blurb. Deliberately modest: we summarise sourced reporting; we don't claim "expert analysis". */
  footerBlurb: "Sourced news from independent outlets, summarised so you can understand what matters, and why.",
  language: "en",
  locale: "en_US",
  nav: [
    { label: "Home", href: "/" },
    { label: "Stories", href: "/stories" },
    ...CATEGORIES.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "Watch", href: "/watch" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];

/** The menu, without the Watch link while videos are hidden. */
export function navItems(opts: { videos: boolean }): readonly NavItem[] {
  return siteConfig.nav.filter((item) => opts.videos || item.href !== "/watch");
}
