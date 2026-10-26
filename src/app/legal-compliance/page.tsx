import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { LegalComplianceContent } from "@/components/legal/LegalComplianceContent";
import { contactEmail, grievanceOfficer } from "@/config/env";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Legal and editorial compliance",
  description: `The laws and professional norms ${siteConfig.name} works under: copyright, defamation, victim anonymity, AI disclosure and how to complain.`,
  path: "/legal-compliance",
});

export default function LegalCompliancePage() {
  return (
    <LegalPage title="Legal and editorial compliance" updated="October 2026">
      <LegalComplianceContent name={siteConfig.name} officer={grievanceOfficer} contactEmail={contactEmail} />
    </LegalPage>
  );
}
