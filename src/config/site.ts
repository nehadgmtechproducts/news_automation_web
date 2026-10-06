/**
 * Static site identity. Pure constants — safe to import anywhere (server or client).
 * Change the brand here and every title, feed, and structured-data block follows.
 */
export const siteConfig = {
  name: "The Brief",
  tagline: "Clear stories. A brighter tomorrow.",
  description:
    "Sourced tech and AI news, as a short read and a 45-second video. Every story lists the independent outlets it was written from.",
  language: "en",
  locale: "en_US",
  nav: [
    { label: "Latest", href: "/" },
    { label: "Technology", href: "/category/technology" },
    { label: "Watch", href: "/watch" },
    { label: "About", href: "/about" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
