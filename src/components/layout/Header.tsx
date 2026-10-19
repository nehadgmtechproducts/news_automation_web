import Link from "next/link";
import { showVideos } from "@/config/env";
import { navItems, siteConfig } from "@/config/site";
import { MobileNav } from "@/components/client/MobileNav";
import { NavLinks } from "@/components/client/NavLinks";
import { SearchForm } from "@/components/search/SearchForm";
import { Container } from "@/components/ui/Container";

export function Header() {
  const items = navItems({ videos: showVideos });
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <Container className="relative flex items-center gap-4 py-3">
        <Link href="/" className="font-serif text-title text-ink">
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary" className="ml-2 hidden lg:block">
          <NavLinks items={items} />
        </nav>
        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchForm id="header-search" />
        </div>
        <div className="ml-auto md:ml-0">
          <MobileNav items={items} />
        </div>
      </Container>
    </header>
  );
}
