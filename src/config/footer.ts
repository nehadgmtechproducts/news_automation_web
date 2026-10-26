import { CATEGORIES } from "@/core/categories";
import { REGIONS, editionPath } from "@/core/regions";

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

/**
 * The footer's link columns. Built from the same lists as the rest of the site (categories,
 * regions), so a new category or edition shows up here with no edit. Pure, so it is tested: every
 * internal link must point at a page that exists.
 */
export function buildFooterColumns(opts: { contactEmail?: string; videos?: boolean } = {}): FooterColumn[] {
  const videos = opts.videos ?? true;
  return [
    {
      title: "Explore",
      links: [
        { label: "Latest News", href: "/latest" },
        { label: "Developing Stories", href: "/stories" },
        ...CATEGORIES.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
        ...(videos ? [{ label: "Watch", href: "/watch" }] : []),
      ],
    },
    {
      title: "Edition",
      links: REGIONS.map((r) => ({ label: r.name, href: editionPath(r) })),
    },
    {
      title: "About",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Editorial Standards", href: "/standards" },
        // No address, no link: a "Contact Us" that goes nowhere is worse than none.
        ...(opts.contactEmail ? [{ label: "Contact Us", href: `mailto:${opts.contactEmail}` }] : []),
      ],
    },
  ];
}

export const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Preferences", href: "/cookies" },
  { label: "Legal & Compliance", href: "/legal-compliance" },
];
