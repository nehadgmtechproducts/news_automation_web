import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "@/components/ui/icons";
import type { Article } from "@/core/article";
import { formatDuration } from "@/core/format";

/** Wide thumbnail with a play badge and duration; links to the article, where the video plays. */
export function VideoCard({ article }: { article: Article }) {
  if (!article.video) return null;
  return (
    <article className="group relative">
      <div className="relative aspect-video overflow-hidden rounded-card bg-surface-sunken shadow-card">
        <Image
          src={article.heroImage.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 left-2 grid size-8 place-items-center rounded-full bg-white text-ink">
          <PlayIcon className="size-4" />
        </span>
        <span className="absolute bottom-2 right-2 rounded-control bg-navy/80 px-2 py-0.5 text-caption font-semibold text-ink-inverse">
          {formatDuration(article.video.durationSeconds)}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-small font-semibold text-ink">
        <Link href={`/articles/${article.slug}#watch`} className="after:absolute after:inset-0 group-hover:text-brand">
          {article.title}
        </Link>
      </h3>
    </article>
  );
}
