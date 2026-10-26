import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description: `The terms for using ${siteConfig.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="October 2026">
      <p>By using {siteConfig.name} you agree to these terms.</p>

      <LegalSection title="Information, not advice">
        <p>
          Everything here is general information. It is not financial, investment, legal, medical or any other professional
          advice, and you should not rely on it as such.
        </p>
      </LegalSection>

      <LegalSection title="AI-assisted content">
        <p>
          Our stories are drafted with AI assistance from the sources listed on each story, and are reviewed by a person
          before publication (see our <Link href="/standards" className="text-brand hover:underline">editorial standards</Link>).
          Mistakes can still happen. Check the linked sources for anything important, and tell us if something is wrong.
        </p>
      </LegalSection>

      <LegalSection title="Our content and others'">
        <p>
          You may link to our stories and quote short excerpts with a link back to the story. Please do not republish whole
          stories without permission. The sources we cite belong to their publishers.
        </p>
      </LegalSection>

      <LegalSection title="Links to other sites">
        <p>We link to other websites. We do not control them and are not responsible for what they contain.</p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We try to keep the site available but do not promise it will always be. We may change the site or these terms; the
          date at the top shows when they last changed. To the extent the law allows, we are not liable for loss arising from
          your use of the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
