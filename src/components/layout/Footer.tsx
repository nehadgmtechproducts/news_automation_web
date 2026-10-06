import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-serif font-semibold text-foreground">{siteConfig.name}</span> — {siteConfig.tagline}
        </p>
        <ul className="flex gap-5">
          <li><Link href="/about" className="hover:text-foreground">How we work</Link></li>
          <li><Link href="/feed.xml" className="hover:text-foreground">RSS</Link></li>
          <li><Link href="/sitemap.xml" className="hover:text-foreground">Sitemap</Link></li>
        </ul>
      </div>
    </footer>
  );
}
