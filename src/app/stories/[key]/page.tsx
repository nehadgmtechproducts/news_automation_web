import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { RelatedStories } from "@/components/article/RelatedStories";
import { LiveBadge } from "@/components/client/LiveBadge";
import { TimeAgo } from "@/components/client/TimeAgo";
import { StoryTimeline } from "@/components/story/StoryTimeline";
import { AiBadge } from "@/components/ui/AiBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Container } from "@/components/ui/Container";
import { Panel } from "@/components/ui/Panel";
import { formatDate } from "@/core/format";
import { isAiGenerated } from "@/core/article";
import { groupStories, toTimelineItem } from "@/core/stories";
import { getAllArticles } from "@/server/articles";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

// Only stories that have actually developed (2+ updates) get a page of their own.
export async function generateStaticParams() {
  return groupStories(await getAllArticles())
    .filter((s) => s.updates.length >= 2)
    .map((s) => ({ key: s.key }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[key]">): Promise<Metadata> {
  const { key } = await params;
  const story = groupStories(await getAllArticles()).find((s) => s.key === key);
  if (!story || story.updates.length < 2) return {};
  return pageMetadata({
    title: `${story.label}: full timeline`,
    description: `${story.updates.length} updates on ${story.label}. Latest: ${story.lead.title}`,
    path: `/stories/${story.key}`,
  });
}

export default async function StoryPage({ params }: PageProps<"/stories/[key]">) {
  const { key } = await params;
  const all = await getAllArticles();
  const stories = groupStories(all);
  const story = stories.find((s) => s.key === key);
  if (!story) notFound();
  // A story nothing has followed up yet IS its article: one URL per piece of content.
  if (story.updates.length < 2) permanentRedirect(`/articles/${story.lead.slug}`);

  const others = stories.filter((s) => s.key !== story.key).slice(0, 4).map((s) => s.lead);

  return (
    <Container className="py-6 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-small text-ink-subtle">
        <Link href="/" className="hover:text-ink">Home</Link> /{" "}
        <Link href="/stories" className="hover:text-ink">Stories</Link>
      </nav>

      <header className="relative isolate overflow-hidden rounded-card bg-navy p-6 text-ink-inverse shadow-card sm:p-8">
        <Image src={story.lead.heroImage.src} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        {isAiGenerated(story.lead.heroImage) && <AiBadge size="full" />}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy/95 via-navy/70 to-navy/30" />
        <div className="flex items-center gap-3">
          <LiveBadge story={story} />
          <CategoryTag category={story.category} variant="solid" />
        </div>
        <h1 className="mt-3 max-w-3xl font-serif text-headline">{story.label}</h1>
        <p className="mt-3 text-small text-ink-inverse/85">
          {story.updates.length} updates · {story.sourceCount} sources · Last update{" "}
          <TimeAgo iso={story.lastUpdatedAt} fallback={formatDate(story.lastUpdatedAt)} />
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="font-serif text-title text-ink">Timeline</h2>
          <Panel className="mt-4">
            <StoryTimeline items={story.updates.map(toTimelineItem)} />
          </Panel>
          <ul className="mt-6 space-y-4">
            {story.updates.map((u) => (
              <li key={u.id} className="rounded-card bg-surface p-4 shadow-card">
                <p className="text-caption text-ink-subtle">{formatDate(u.publishedAt)}</p>
                <h3 className="font-serif text-heading text-ink">
                  <Link href={`/articles/${u.slug}`} className="hover:text-brand">{u.title}</Link>
                </h3>
                <p className="mt-1 text-small text-ink-muted">{u.dek}</p>
              </li>
            ))}
          </ul>
        </section>
        <aside>
          <RelatedStories articles={others} title="More stories" />
        </aside>
      </div>
    </Container>
  );
}
