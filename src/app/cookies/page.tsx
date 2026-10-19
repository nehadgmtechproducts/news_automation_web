import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Cookie preferences",
  description: `${siteConfig.name} does not use cookies, so there is nothing to opt out of.`,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie preferences" updated="October 2026">
      <p>
        {siteConfig.name} does <strong>not</strong> use cookies. We set no cookies at all: no advertising cookies, no
        analytics cookies, and none for remembering your settings. We also do not use other browser storage to track you.
      </p>
      <LegalSection title="Nothing to change">
        <p>
          Because there are no cookies, there are no cookie settings to choose from and no consent banner. Everything on
          this site, including fonts and images, is served from our own server, so loading a page does not send your visit
          to another company.
        </p>
      </LegalSection>
      <LegalSection title="If this changes">
        <p>
          If we ever add something that needs cookies, we will tell you here and ask for your permission first. See the{" "}
          <Link href="/privacy" className="text-brand hover:underline">privacy policy</Link> for what we do collect.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
