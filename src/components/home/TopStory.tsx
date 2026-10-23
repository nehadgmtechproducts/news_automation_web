"use client";

import { useState } from "react";
import { DevelopingStories } from "@/components/story/DevelopingStories";
import { featuredFor, type FeaturedData, type StorySummary } from "@/core/stories";
import { FeaturedStory } from "./FeaturedStory";

/**
 * The home page's top row: the lead story card beside "Developing stories". Opening a story in the
 * panel switches the card to that story (cover, headline, summary, "Read full story" link); closing it
 * goes back to the day's lead. A Client Component only to hold that one piece of shared state.
 */
export function TopStory({ lead, stories }: { lead: FeaturedData; stories: StorySummary[] }) {
  const [selected, setSelected] = useState<string | null>(stories[0]?.key ?? null);

  return (
    <section aria-label="Top story" className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <FeaturedStory featured={featuredFor(stories, selected, lead)} />
      {/* The relative box + the panel's absolute fill keep the lead story's height fixed. */}
      <div className="relative">
        <DevelopingStories stories={stories} onSelect={setSelected} />
      </div>
    </section>
  );
}
