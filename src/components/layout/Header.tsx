import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MobileNav } from "@/components/client/MobileNav";

export function Header() {
  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-6 text-sm font-medium">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav items={siteConfig.nav} />
      </div>
    </header>
  );
}
