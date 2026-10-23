import Image from "next/image";
import Link from "next/link";
import { TimeAgo } from "@/components/client/TimeAgo";
import { VerifiedBadge } from "@/components/article/VerifiedBadge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";
import { formatDate } from "@/core/format";
import type { FeaturedData } from "@/core/stories";

/**
 * The lead story: headline over a full-bleed cover. The cover is text-free (the headline is real
 * HTML, so it is selectable, translatable and indexable), with a dark gradient for legibility.
 * It draws plain `FeaturedData`, so it can follow whichever story is selected in "Developing stories".
 */
export function FeaturedStory({ featured }: { featured: FeaturedData }) {
  const href = `/articles/${featured.slug}`;
  return (
    // key: a new story is a new card, so the cover cross-fades in instead of swapping abruptly
    <article key={featured.slug} className="featured-enter relative isolate flex min-h-[26rem] overflow-hidden rounded-card bg-navy text-ink-inverse shadow-card lg:h-[39rem]">
      <Image
        src={featured.coverSrc}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-navy/95 via-navy/55 to-navy/10" />

      <div className="mt-auto flex w-full flex-col gap-4 p-6 sm:p-8">
        <CategoryTag category={featured.category} variant="solid" className="self-start" />
        <h2 className="max-w-3xl font-serif text-hero">
          <Link href={href} className="hover:underline">{featured.title}</Link>
        </h2>
        <p className="line-clamp-3 max-w-2xl text-subtitle text-ink-inverse/90">{featured.dek}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-inverse/85">
            <VerifiedBadge count={featured.sourceCount} tone="dark" />
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              <TimeAgo iso={featured.publishedAt} fallback={formatDate(featured.publishedAt)} />
            </span>
            <span>{featured.readMinutes} min read</span>
          </div>
          <ButtonLink href={href} variant="inverse">
            Read full story <ArrowRightIcon />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
