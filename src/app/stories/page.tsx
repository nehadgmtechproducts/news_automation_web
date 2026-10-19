import type { Metadata } from "next";
import { StoryRow } from "@/components/story/StoryRow";
import { Container } from "@/components/ui/Container";
import { groupStories } from "@/core/stories";
import { getAllArticles } from "@/server/articles";
import { pageMetadata } from "@/seo/metadata";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Stories",
  description: "Ongoing stories, with every update on one timeline.",
  path: "/stories",
});

export default async function StoriesPage() {
  const stories = groupStories(await getAllArticles());

  return (
    <Container className="py-8">
      <h1 className="font-serif text-headline text-ink">Stories</h1>
      <p className="mt-2 text-ink-muted">Ongoing stories, with every update on one timeline.</p>
      {stories.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-surface p-6 text-ink-muted">No stories yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* the first rows are above the fold: load their covers eagerly */}
          {stories.map((s, i) => (
            <StoryRow key={s.key} story={s} priority={i < 2} />
          ))}
        </div>
      )}
    </Container>
  );
}
