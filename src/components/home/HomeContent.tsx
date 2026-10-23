import { ArticleCard } from "@/components/article/ArticleCard";
import { MostRead } from "@/components/article/MostRead";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import type { Article } from "@/core/article";
import { CATEGORIES } from "@/core/categories";
import type { RegionName } from "@/core/regions";
import { groupStories, toFeatured, toStorySummary } from "@/core/stories";
import { EditionBar } from "./EditionBar";
import { TopStory } from "./TopStory";

/**
 * ONE grid for both the Latest news cards and the Watch cards. They sit in panels of the same width,
 * so sharing the definition guarantees their cards are the same width at every screen size: change
 * the columns here and both rows follow.
 */
const CARD_ROW = "grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5";

/**
 * The home layout, shared by `/` (Global edition) and `/edition/<region>`. It receives the
 * already-filtered stories as props, so it knows nothing about where they came from.
 */
export function HomeContent({
  articles,
  edition,
  mostRead,
}: {
  articles: Article[];
  edition: RegionName;
  mostRead: Article[];
}) {
  const [lead] = articles;
  const videos = articles.filter((a) => a.video);
  const hasVideos = videos.length > 0; // false whenever videos are hidden (SHOW_VIDEOS), see server/articles.ts
  const stories = groupStories(articles).slice(0, 6).map((story) => toStorySummary(story));
  const heading = edition === "Global" ? siteConfig.name : `${siteConfig.name} — ${edition} edition`;

  return (
    <Container className="space-y-8 py-6 lg:py-8">
      <h1 className="sr-only">{heading}: latest news across technology, politics, finance, entertainment, launches and healthcare</h1>
      <EditionBar active={edition} />

      {!lead ? (
        <div className="py-20 text-center">
          <p className="font-serif text-headline text-ink">No stories yet</p>
          <p className="mt-2 text-ink-muted">New stories appear here as soon as they are verified against multiple sources.</p>
        </div>
      ) : (
        <>
          <TopStory lead={toFeatured(lead)} stories={stories} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)]">
            <Panel className="sm:p-6">
              <section aria-labelledby="latest-news">
                <SectionHeading id="latest-news" title="Latest news" href="/latest" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip href="/" active on="panel">All</Chip>
                  {CATEGORIES.map((c) => (
                    <Chip key={c.slug} href={`/category/${c.slug}`} on="panel">{c.name}</Chip>
                  ))}
                </div>
                <div className={cn("mt-6", CARD_ROW)}>
                  {articles.slice(0, 5).map((a) => (
                    <ArticleCard key={a.id} article={a} compact />
                  ))}
                </div>
              </section>
            </Panel>

            <aside className="space-y-6" aria-label="More to read">
              <MostRead articles={mostRead} />
            </aside>
          </div>

          {hasVideos && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)]">
              <Panel className="sm:p-6">
                <section aria-labelledby="watch">
                  <SectionHeading id="watch" title="Watch" href="/watch" linkLabel="See all videos" />
                  <p className="mt-1 text-small text-ink-muted">Quick, engaging videos that bring the latest stories to life.</p>
                  <div className={cn("mt-5", CARD_ROW)}>
                    {videos.slice(0, 5).map((a) => (
                      <VideoCard key={a.id} article={a} />
                    ))}
                  </div>
                </section>
              </Panel>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
