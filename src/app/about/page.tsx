import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "How we work",
  description: `How ${siteConfig.name} chooses, sources, writes and labels its stories — including where AI is used.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="prose-brief mx-auto max-w-2xl text-lg">
      <h1 className="mb-6 font-serif text-4xl font-semibold">How we work</h1>
      <p>
        {siteConfig.name} publishes short, sourced explanations of technology and AI news. We would rather be
        clear about how that is done than pretend a newsroom of reporters sits behind every story.
      </p>
      <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold">Verified from multiple sources</h2>
      <p>
        A story is only published when it appears across at least two independent outlets. The badge on each story
        shows how many distinct publishers it was written from, and every claim carries a numbered citation that links
        to those sources at the bottom of the page.
      </p>
      <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold">Where AI is used</h2>
      <ul>
        <li>Articles are drafted by an AI model from the cited sources, with figures checked against those sources.</li>
        <li>The 45-second videos use AI-generated footage and a synthetic voice. They illustrate the story and are not footage of real events.</li>
        <li>Stories are reviewed by a person before they are published.</li>
      </ul>
      <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold">Corrections</h2>
      <p>If you spot a mistake, tell us and we will correct the story and note the change.</p>
    </article>
  );
}
