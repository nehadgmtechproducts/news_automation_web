import { CATEGORIES } from "@/core/categories";

/**
 * Static site identity. Pure constants — safe to import anywhere (server or client).
 * Change the brand here and every title, feed, and structured-data block follows.
 */
export const siteConfig = {
  name: "The Brief",
  tagline: "Clear stories. A brighter tomorrow.",
  description:
    "Sourced news on technology, politics, finance, entertainment and new launches, as a short read and a 45-second video. Every story lists the independent outlets it was written from.",
  language: "en",
  locale: "en_US",
  nav: [
    { label: "Latest", href: "/" },
    ...CATEGORIES.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "Watch", href: "/watch" },
    { label: "About", href: "/about" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
