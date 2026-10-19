import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { REGIONS, filterByEdition, hasOwnStories, regionBySlug } from "@/core/regions";
import { getAllArticles } from "@/server/articles";
import { getMostRead } from "@/server/reads";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

// Global is the home page itself, so it has no /edition/ page.
export function generateStaticParams() {
  return REGIONS.filter((r) => r.name !== "Global").map((r) => ({ edition: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/edition/[edition]">): Promise<Metadata> {
  const { edition } = await params;
  const region = regionBySlug(edition);
  if (!region || region.name === "Global") return {};
  const meta = pageMetadata({
    title: `${region.name} edition`,
    description: region.description,
    path: `/edition/${region.slug}`,
  });
  // With no stories of its own, this page would just repeat the Global ones: keep it out of search.
  const own = hasOwnStories(await getAllArticles(), region.name);
  return own ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function EditionPage({ params }: PageProps<"/edition/[edition]">) {
  const { edition } = await params;
  const region = regionBySlug(edition);
  if (!region) notFound();
  if (region.name === "Global") permanentRedirect("/"); // one URL per page, for search engines

  const articles = filterByEdition(await getAllArticles(), region.name);
  return <HomeContent articles={articles} edition={region.name} mostRead={await getMostRead(articles)} />;
}
