import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { Container } from "@/components/ui/Container";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { showVideos, siteUrl } from "@/config/env";
import { formatDuration } from "@/core/format";
import { JsonLd } from "@/seo/JsonLd";
import { videoObjectJsonLd } from "@/seo/json-ld";
import { pageMetadata } from "@/seo/metadata";
import { getVideoArticles } from "@/server/articles";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Watch",
  description: "News stories in about 45 seconds. Every video links to the full sourced article.",
  path: "/watch",
});

export default async function WatchPage() {
  if (!showVideos) notFound(); // videos are switched off: there is no Watch page
  const articles = await getVideoArticles();

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">Watch</h1>
      <p className="mt-2 text-ink-muted">The story in about 45 seconds. The full sourced article is one click away.</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-ink-muted">No videos yet.</p>
      ) : (
        <ul className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => (
            <li key={a.id}>
              <JsonLd data={videoObjectJsonLd(a, siteUrl)} />
              <VideoPlayer video={a.video!} label={`Video: ${a.title}`} />
              <h2 className="mt-3 font-serif text-heading text-ink">
                <Link href={`/articles/${a.slug}`} className="hover:text-brand">{a.title}</Link>
              </h2>
              <div className="mt-1 flex items-center gap-3">
                <ArticleMeta article={a} />
                <span className="text-caption text-ink-subtle">{formatDuration(a.video!.durationSeconds)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
