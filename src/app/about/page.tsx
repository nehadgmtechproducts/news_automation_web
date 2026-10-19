import type { Metadata } from "next";
import Link from "next/link";
import { ContactSentence, LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { contactEmail, showVideos } from "@/config/env";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "How we work",
  description: `How ${siteConfig.name} chooses, sources, writes and labels its stories, including where AI is used.`,
  path: "/about",
});

const link = "text-brand hover:underline";

export default function AboutPage() {
  return (
    <LegalPage title="How we work">
      <p>
        {siteConfig.name} publishes short, sourced explanations of news on technology, politics, finance, entertainment and
        new launches. We would rather be clear about how that is done than pretend a newsroom of reporters sits behind every
        story.
      </p>

      <LegalSection title="Verified from multiple sources">
        <p>
          A story is only published when it appears across independent outlets. The badge on each story shows how many
          distinct publishers it was written from, and every claim carries a numbered citation that links to those sources at
          the bottom of the page.
        </p>
      </LegalSection>

      <LegalSection title="Where AI is used">
        <ul>
          <li>Articles are drafted by an AI model from the cited sources, with figures checked against those sources.</li>
          {showVideos && (
            <li>The 45-second videos use a synthetic voice and either text on a coloured background or AI-generated footage. They illustrate the story and are not footage of real events.</li>
          )}
          <li>Stories are reviewed by a person before they are published.</li>
        </ul>
        <p>
          The full rules are in our <Link href="/standards" className={link}>editorial standards</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Corrections">
        <p>If you spot a mistake, tell us and we will correct the story and note the change.</p>
        <ContactSentence email={contactEmail} />
      </LegalSection>

      <LegalSection title="Your privacy">
        <p>
          We use no cookies and keep no personal data beyond a newsletter address if you give us one. See the{" "}
          <Link href="/privacy" className={link}>privacy policy</Link> for the details.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
