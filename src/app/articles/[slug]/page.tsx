import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/ArticleBody";
import { HealthNotice } from "@/components/article/HealthNotice";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { RelatedStories } from "@/components/article/RelatedStories";
import { SourceList } from "@/components/article/SourceList";
import { OutlineNav } from "@/components/client/OutlineNav";
import { ReadBeacon } from "@/components/client/ReadBeacon";
import { ShareButton } from "@/components/client/ShareButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StoryTimelinePanel } from "@/components/story/StoryTimelinePanel";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Container } from "@/components/ui/Container";
import { Panel } from "@/components/ui/Panel";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { siteUrl } from "@/config/env";
import { siteConfig } from "@/config/site";
import { articleBreadcrumbs, linkableCrumbs } from "@/core/breadcrumbs";
import { categoryByName } from "@/core/categories";
import { formatDate, formatTimeUtc } from "@/core/format";
import { buildOutline } from "@/core/outline";
import { groupStories } from "@/core/stories";
import { JsonLd } from "@/seo/JsonLd";
import { breadcrumbJsonLd, newsArticleJsonLd, videoObjectJsonLd } from "@/seo/json-ld";
import { articleMetadata } from "@/seo/metadata";
import { getAllArticles, getArticle, getRelatedArticles } from "@/server/articles";

export const revalidate = 300;

// Pre-render every known article at build time; new ones are rendered on first request, then cached.
export async function generateStaticParams() {
  return (await getAllArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return article ? articleMetadata(article) : {};
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const story = groupStories(await getAllArticles()).find((s) => s.key === article.story.key)!;
  // "Related articles" are OTHER stories: this story's own updates are already in the timeline beside it.
  const related = (await getRelatedArticles(article, 12)).filter((a) => a.story.key !== story.key).slice(0, 5);

  const outline = buildOutline(article);
  const sectionIds = outline.filter((o) => !["key-takeaways", "why-it-matters", "sources"].includes(o.id));
  const categoryPath = `/category/${categoryByName(article.category)?.slug ?? ""}`;
  const url = new URL(`/articles/${article.slug}`, siteUrl).toString();
  const crumbs = articleBreadcrumbs(article, { key: story.key, label: story.label, updateCount: story.updates.length });

  return (
    <Container className="py-6 lg:py-8">
      <ReadBeacon slug={article.slug} />
      <JsonLd data={newsArticleJsonLd(article, siteUrl)} />
      <JsonLd data={videoObjectJsonLd(article, siteUrl)} />
      <JsonLd data={breadcrumbJsonLd(linkableCrumbs(crumbs), siteUrl)} />

      <Breadcrumbs items={crumbs} />

      {/* grid-cols-1: below lg the single column must be allowed to shrink (see README, "stacked grids") */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_20rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <OutlineNav items={outline} />
          </div>
        </aside>

        <Panel className="min-w-0 sm:p-8">
          <article>
            <header>
              <div className="flex items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-subtle">
                  <Link href={categoryPath}><CategoryTag category={article.category} /></Link>
                  <span aria-hidden>·</span>
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)} · {formatTimeUtc(article.publishedAt)}
                  </time>
                </p>
                <ShareButton url={url} title={article.title} iconOnly />
              </div>
              <h1 className="mt-3 font-serif text-headline text-ink">{article.title}</h1>
              <p className="mt-4 text-subtitle text-ink-muted">{article.dek}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-subtle">
                <span>
                  By {siteConfig.name} · <Link href="/standards" className="text-brand hover:underline">AI-assisted</Link>
                </span>
                <ArticleMeta article={article} showReadTime showTime={false} />
              </div>
            </header>

            <figure className="mt-6">
              <Image
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                width={article.heroImage.width}
                height={article.heroImage.height}
                sizes="(min-width: 1280px) 700px, (min-width: 1024px) 60vw, 100vw"
                priority
                className="aspect-video w-full rounded-card object-cover"
              />
              {article.heroImage.credit && (
                <figcaption className="mt-2 text-caption text-ink-subtle">{article.heroImage.credit}</figcaption>
              )}
            </figure>

            {article.keyTakeaways.length > 0 && (
              <section id="key-takeaways" aria-labelledby="takeaways-heading" className="mt-8 rounded-card bg-brand-soft p-5">
                <h2 id="takeaways-heading" className="font-serif text-heading text-ink">Key takeaways</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-ink">
                  {article.keyTakeaways.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {article.video && (
              <section id="watch" aria-labelledby="watch-heading" className="mt-8">
                <h2 id="watch-heading" className="mb-3 font-serif text-title text-ink">Watch the 45-second version</h2>
                <VideoPlayer video={article.video} label={`Video summary: ${article.title}`} />
              </section>
            )}

            <div className="prose-brief mt-8 max-w-2xl text-body-lg text-ink">
              {article.sections.map((s, i) => (
                <section key={s.heading} id={sectionIds[i]?.id}>
                  <h2 className="mb-3 mt-8 font-serif text-title text-ink">{s.heading}</h2>
                  <ArticleBody body={s.body} />
                </section>
              ))}
              <section id="why-it-matters">
                <h2 className="mb-3 mt-8 font-serif text-title text-ink">Why it matters</h2>
                <ArticleBody body={article.whyItMatters} />
              </section>
            </div>

            <SourceList sources={article.sources} />

            {article.category === "Healthcare" && <HealthNotice />}

            <p className="mt-8 rounded-card bg-canvas p-4 text-small text-ink-muted">
              This story was drafted with AI assistance from the sources above{article.video ? ", and its video uses AI-generated footage" : ""}.{" "}
              <Link href="/about" className="text-brand hover:underline">How we work</Link>.
            </p>
          </article>
        </Panel>

        <aside className="space-y-6 lg:col-span-2 xl:col-span-1">
          <StoryTimelinePanel story={story} currentSlug={article.slug} />
          <RelatedStories articles={related} />
        </aside>
      </div>
    </Container>
  );
}
