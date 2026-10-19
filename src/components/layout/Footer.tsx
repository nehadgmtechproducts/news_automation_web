import type { ReactNode } from "react";
import Link from "next/link";
import { contactEmail, showVideos, socialUrls } from "@/config/env";
import { buildFooterColumns, legalLinks, type FooterLink } from "@/config/footer";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/ui/icons";

const SOCIALS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "x", label: "X", Icon: XIcon },
] as const;

// py-1 makes each link a comfortable tap target (about 25px tall) without changing the desktop look.
const linkClass = "inline-block py-1 text-brand hover:text-brand-strong";

/** mailto: links can't go through next/link (it is for pages). */
function FooterAnchor({ link }: { link: FooterLink }) {
  return link.href.startsWith("mailto:") ? (
    <a href={link.href} className={linkClass}>{link.label}</a>
  ) : (
    <Link href={link.href} className={linkClass}>{link.label}</Link>
  );
}

/** `newsletter` is the sign-up banner, supplied by the layout (it needs a Server Action, which lives in the app layer). */
export function Footer({ newsletter }: { newsletter?: ReactNode }) {
  const columns = buildFooterColumns({ contactEmail, videos: showVideos });
  const socials = SOCIALS.filter((s) => socialUrls[s.key]);

  return (
    <>
      {newsletter && <Container className="mt-16">{newsletter}</Container>}
      <footer className={newsletter ? "mt-8 border-t border-line bg-surface" : "mt-16 border-t border-line bg-surface"}>
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-0">
          <div className="lg:pr-10">
            <p className="font-serif text-headline text-ink">{siteConfig.name}</p>
            <p className="mt-2 font-semibold text-ink-muted">{siteConfig.tagline}</p>
            <p className="mt-3 max-w-xs text-small text-ink-muted">{siteConfig.footerBlurb}</p>
            {socials.length > 0 && (
              <ul className="mt-5 flex gap-4" aria-label="Follow us">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a href={socialUrls[key]} target="_blank" rel="noopener noreferrer" aria-label={`${siteConfig.name} on ${label}`} className="text-ink hover:text-brand">
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="lg:border-l lg:border-line lg:px-8">
              <p className="mb-4 text-label uppercase text-ink-subtle">{col.title}</p>
              <ul className="space-y-0.5 text-small">
                {col.links.map((l) => (
                  <li key={l.label}><FooterAnchor link={l} /></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-caption sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-subtle">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <ul className="flex flex-wrap divide-x divide-line">
            {legalLinks.map((l) => (
              <li key={l.label} className="px-4 first:pl-0 last:pr-0">
                <Link href={l.href} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      </footer>
    </>
  );
}
