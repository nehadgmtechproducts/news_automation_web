import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SourceList } from "@/components/article/SourceList";
import { VerifiedBadge } from "@/components/article/VerifiedBadge";
import { ShareButton } from "@/components/client/ShareButton";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { siteUrl } from "@/config/env";
import { formatDate, readingMinutes } from "@/core/format";
import { categoryByName } from "@/core/categories";
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

  const related = await getRelatedArticles(article);
  const categoryPath = `/category/${categoryByName(article.category)?.slug ?? ""}`;
  const url = new URL(`/articles/${article.slug}`, siteUrl).toString();

  return (
    <>
      <JsonLd data={newsArticleJsonLd(article, siteUrl)} />
      <JsonLd data={videoObjectJsonLd(article, siteUrl)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: article.category, path: categoryPath },
            { name: article.title, path: `/articles/${article.slug}` },
          ],
          siteUrl,
        )}
      />

      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link href={categoryPath} className="hover:text-foreground">{article.category}</Link>
        </nav>

        <header>
          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-xl text-muted">{article.dek}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <VerifiedBadge article={article} />
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>{readingMinutes(article)} min read</span>
            <ShareButton url={url} title={article.title} />
          </div>
        </header>

        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes="(min-width: 768px) 768px, 100vw"
          priority
          className="mt-8 aspect-video w-full rounded-lg object-cover"
        />

        {article.video && (
          <section aria-labelledby="watch-heading" className="mt-10">
            <h2 id="watch-heading" className="mb-3 font-serif text-2xl font-semibold">Watch the 45-second version</h2>
            <VideoPlayer video={article.video} label={`Video summary: ${article.title}`} />
          </section>
        )}

        {article.keyTakeaways.length > 0 && (
          <aside aria-labelledby="takeaways" className="mt-10 rounded-lg border border-line bg-surface p-5">
            <h2 id="takeaways" className="font-serif text-xl font-semibold">Key takeaways</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {article.keyTakeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        )}

        <div className="prose-brief mt-10 text-lg">
          {article.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold">{s.heading}</h2>
              <ArticleBody body={s.body} />
            </section>
          ))}
          <section>
            <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold">Why it matters</h2>
            <ArticleBody body={article.whyItMatters} />
          </section>
        </div>

        <SourceList sources={article.sources} />

        <p className="mt-8 rounded bg-surface p-4 text-sm text-muted">
          This story was drafted with AI assistance from the sources above, and its video uses AI-generated footage.{" "}
          <Link href="/about" className="text-accent hover:underline">How we work</Link>.
        </p>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto mt-14 max-w-6xl border-t border-line pt-8">
          <h2 id="related" className="mb-6 font-serif text-2xl font-semibold">More stories</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
