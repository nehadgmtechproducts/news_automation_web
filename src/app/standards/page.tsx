import type { Metadata } from "next";
import { ContactSentence, LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { contactEmail, showVideos } from "@/config/env";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Editorial standards",
  description: `The rules every ${siteConfig.name} story is held to: sourcing, fact checking, how AI is used, and human review.`,
  path: "/standards",
});

export default function StandardsPage() {
  return (
    <LegalPage title="Editorial standards" updated="October 2026">
      <p>
        These are the rules every story on {siteConfig.name} is held to. They describe what our system does, not what we
        hope it does.
      </p>

      <LegalSection title="Sources">
        <p>
          A story is picked up when at least three independent outlets are covering it, at least one of them doing original
          reporting. Whatever picks a story, an article is only published with at least two cited sources. Every article lists
          the sources it was written from, and the &ldquo;sources verified&rdquo; badge counts real, distinct publishers.
        </p>
      </LegalSection>

      <LegalSection title="Facts">
        <p>
          Each statement of fact must appear in at least two of the article&apos;s sources. A claim only one source makes is left
          out or clearly attributed to that source. Numbers are checked against the sources, and an article containing a
          figure its sources do not contain is rejected.
        </p>
      </LegalSection>

      <LegalSection title="How AI is used">
        <ul>
          <li>Articles are drafted by an AI model from the cited sources and nothing else. It is not allowed to add outside knowledge.</li>
          <li>Many story pictures are AI-generated illustrations of the subject. They are not photographs of the event and are labelled &ldquo;Illustration generated with AI&rdquo; on the article page. For politics stories we avoid generating images of people, crowds, soldiers or weapons.</li>
          {showVideos && (
            <>
              <li>Voiceovers are synthetic voices.</li>
              <li>Videos are either typographic text on a coloured background, or AI-generated footage. Generated footage illustrates a story; it is not footage of real events.</li>
              <li>For politics stories we do not use generated footage showing people, crowds, soldiers, weapons or real events.</li>
            </>
          )}
        </ul>
      </LegalSection>

      <LegalSection title="Human review">
        <p>A person reviews each story before it is published.</p>
      </LegalSection>

      <LegalSection title="Rules by topic">
        <ul>
          <li><strong>Politics.</strong> Every claim is attributed to a named person, body or outlet. No predictions, no speculation about motives, no endorsement of any party or candidate, and no graphic detail.</li>
          <li><strong>Finance.</strong> Prices and figures are reported as sourced, with the date they refer to. We never recommend buying, selling or holding anything, and never forecast prices.</li>
          <li><strong>Entertainment and sports.</strong> Results, names and titles are reported exactly as sourced. A rumour reported by only one outlet is left out or attributed.</li>
          <li><strong>Launches.</strong> Specifications, prices and availability are the manufacturer&apos;s claims and are described that way.</li>
          <li><strong>Healthcare.</strong> Every medical claim is attributed to the study, journal, regulator, health body or company that made it, with the kind of evidence stated when our sources give it (for example a small trial or an animal study). We never say something cures, prevents or treats a condition unless a regulator or the study&apos;s authors said so, we do not confuse correlation with causation, and we give no medical advice. Case and death figures are attributed to the body that reported them.</li>
          <li><strong>Technology.</strong> Performance and benchmark claims belong to the company that made them.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Corrections">
        <p>If we get something wrong, we correct the story and note the change.</p>
        <ContactSentence email={contactEmail} lead="To report a mistake, email us at" />
      </LegalSection>
    </LegalPage>
  );
}
