import Image from "next/image";
import Link from "next/link";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Article } from "@/core/article";

/**
 * The lead story: headline over a full-bleed cover. The cover is text-free (the headline is real
 * HTML, so it is selectable, translatable and indexable), with a dark gradient for legibility.
 */
export function FeaturedStory({ article }: { article: Article }) {
  return (
    <article className="relative isolate flex min-h-[26rem] overflow-hidden rounded-card bg-navy text-ink-inverse shadow-card lg:min-h-[31rem]">
      <Image
        src={article.heroImage.src}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-navy/95 via-navy/55 to-navy/10" />

      <div className="mt-auto flex w-full flex-col gap-4 p-6 sm:p-8">
        <CategoryTag category={article.category} variant="solid" className="self-start" />
        <h2 className="max-w-3xl font-serif text-hero">
          <Link href={`/articles/${article.slug}`} className="hover:underline">{article.title}</Link>
        </h2>
        <p className="line-clamp-3 max-w-2xl text-subtitle text-ink-inverse/90">{article.dek}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ArticleMeta article={article} tone="dark" showReadTime />
          <ButtonLink href={`/articles/${article.slug}`} variant="inverse">
            Read full story <ArrowRightIcon />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
