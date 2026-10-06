import type { Metadata } from "next";
import Link from "next/link";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { siteUrl } from "@/config/env";
import { formatDuration } from "@/core/format";
import { JsonLd } from "@/seo/JsonLd";
import { videoObjectJsonLd } from "@/seo/json-ld";
import { pageMetadata } from "@/seo/metadata";
import { getVideoArticles } from "@/server/articles";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Watch",
  description: "Tech and AI stories in about 45 seconds. Every video links to the full sourced article.",
  path: "/watch",
});

export default async function WatchPage() {
  const articles = await getVideoArticles();

  return (
    <>
      <h1 className="font-serif text-4xl font-semibold">Watch</h1>
      <p className="mt-2 text-muted">The story in about 45 seconds. The full sourced article is one click away.</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-muted">No videos yet.</p>
      ) : (
        <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.id}>
              <JsonLd data={videoObjectJsonLd(a, siteUrl)} />
              <VideoPlayer video={a.video!} label={`Video: ${a.title}`} />
              <h2 className="mt-3 font-serif text-lg font-semibold leading-snug">
                <Link href={`/articles/${a.slug}`} className="hover:underline">{a.title}</Link>
              </h2>
              <p className="text-xs text-muted">{formatDuration(a.video!.durationSeconds)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
