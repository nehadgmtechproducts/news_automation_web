import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { siteConfig } from "@/config/site";
import { getAllArticles } from "@/server/articles";
import { getMostRead } from "@/server/reads";
import { pageMetadata } from "@/seo/metadata";

// ISR: static HTML served from cache, regenerated in the background at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  ...pageMetadata({ title: `${siteConfig.name} — ${siteConfig.tagline}`, description: siteConfig.description, path: "/" }),
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

export default async function HomePage() {
  const articles = await getAllArticles();
  return <HomeContent articles={articles} edition="Global" mostRead={await getMostRead(articles)} />;
}
