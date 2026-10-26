import type { Metadata } from "next";
import Link from "next/link";
import { ContactSentence, LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { contactEmail } from "@/config/env";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: `What ${siteConfig.name} collects about its readers, why, and how to have it removed.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="October 2026">
      <p>
        We collect as little as we can. This page lists everything we collect, and what we do not.
      </p>

      <LegalSection title="What we collect">
        <p>
          <strong>Anonymous read counts.</strong> When you stay on an article for a few seconds, your browser tells us that
          the article was read. This powers the &ldquo;Most read today&rdquo; list. To avoid counting you twice, your IP address
          and browser details are turned into a short code, mixed with a random value that changes every day and is deleted
          after two days. We do not store your IP address or browser details, and the counts cannot tell us who you are.
        </p>
        <p>
          <strong>Newsletter sign-ups.</strong> If you subscribe to the daily roundup, we store the email address you enter and
          the time you entered it, in a private file on our server, only to send you that roundup. We do not share it.
        </p>
        <p>
          <strong>Server logs.</strong> Like most websites, the server that hosts this site may keep standard technical logs,
          for example the address of a visitor and the page requested, for security and troubleshooting.
        </p>
      </LegalSection>

      <LegalSection title="What we do not do">
        <ul>
          <li>We do not use cookies (see <Link href="/cookies" className="text-brand hover:underline">Cookie preferences</Link>).</li>
          <li>We do not run advertising or analytics trackers, and we do not load fonts, scripts, images or media from other companies&apos; servers.</li>
          <li>We do not sell or share personal information.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Links to other sites">
        <p>
          Each article links to the outlets it was written from. Those sites have their own privacy policies, which we do not
          control.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>You can ask us to remove your newsletter address, or to tell you what we hold about you, at any time.</p>
        <ContactSentence email={contactEmail} />
      </LegalSection>
    </LegalPage>
  );
}
