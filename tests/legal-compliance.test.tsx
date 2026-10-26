import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LegalDisclaimer } from "@/components/article/LegalDisclaimer";
import { GrievanceBlock, LegalComplianceContent, STATUTES } from "@/components/legal/LegalComplianceContent";
import { legalLinks } from "@/config/footer";

const read = (f: string) => readFileSync(f, "utf8");
const officer = { name: "A. Sharma", email: "grievance@thebrief.example", address: "12 Example Road, Mumbai 400001" };
const page = (o?: typeof officer, email?: string) => renderToStaticMarkup(<LegalComplianceContent name="The Brief" officer={o} contactEmail={email} />);

describe("/legal-compliance content", () => {
  const html = page(officer);

  it("cites the provisions the charter relies on", () => {
    for (const ref of ["Article 19(1)(a)", "Article 19(2)", "Section 52(1)(a)(ii) and (iii)", "Section 356", "Exceptions 1 to 4",
      "Sections 72 and 73", "Section 23", "Berne Convention", "10bis", "17 U.S.C. § 107", "5(3)(c)", "Section 79", "Press Council of India"]) {
      expect(html, ref).toContain(ref);
    }
  });

  it("has no placeholders left in it", () => {
    expect(html).not.toMatch(/\[Insert|\[Platform|Insert Full Name|undefined|\{\{/);
  });

  it("does not cite rule numbers we could not verify", () => {
    expect(html).not.toMatch(/G\.S\.R|Rule 3\(3\)|Rule 3\(1\)\(b\)/);
  });

  it("describes the pictures exactly as the pipeline treats them", () => {
    expect(html).toContain("one of three things");
    expect(html).toContain("photograph taken from one of the story");
    expect(html).toContain("carries the source");                      // credit
    expect(html).toContain("link to the page it");                     // and a link back
    expect(html).toContain("file photo");
    expect(html).toContain("Wikimedia Commons under a free");
    expect(html).toContain("it shows the subject, not the event");     // a file photo is never presented as a photo of the event
    expect(html).toContain("(CC0, public domain and CC BY)");          // exactly the licences the backend accepts
    expect(html).toContain("(for example Getty Images, AP, Reuters or AFP)");
    expect(html).toContain("never use a real photograph on a story");       // the identity-protection rule
    expect(html).not.toContain("do not republish other outlets&#x27; pictures");   // no longer true: we do use credited source photos
  });

  it("makes only claims that are true of this site: no comment section, AI pictures labelled", () => {
    expect(html).toContain("does not host reader comments");
    expect(html).toContain("Illustration generated with AI");
    expect(html).not.toMatch(/third-party photographs/i);
  });

  it("describes the identity check exactly as the backend does it (flag, list of names, affirmation)", () => {
    expect(html).toContain("detected automatically and flagged to the reviewer");
    expect(html).toContain("every person and place it names");
    expect(html).toContain("must confirm that nobody identifiable");
    expect(html).not.toContain("never discloses");        // we promise a rule and a check, not a guarantee
  });

  it("names its sources and describes the human review", () => {
    expect(html).toContain("lists the outlets it was written from");
    expect(html).toContain("A person reads every story");
  });

  it("lists every area in the statute table, and the table matches the data", () => {
    expect(STATUTES).toHaveLength(6);
    for (const s of STATUTES) expect(html).toContain(s.area);
  });
});

describe("Grievance Officer block", () => {
  it("shows the officer's name, a mail link and the address when configured", () => {
    const html = renderToStaticMarkup(<GrievanceBlock officer={officer} />);
    expect(html).toContain("A. Sharma");
    expect(html).toContain('href="mailto:grievance@thebrief.example"');
    expect(html).toContain("12 Example Road");
  });

  it("without an officer it names nobody: falls back to the contact email, or shows nothing", () => {
    expect(renderToStaticMarkup(<GrievanceBlock contactEmail="hello@thebrief.example" />)).toContain("hello@thebrief.example");
    expect(renderToStaticMarkup(<GrievanceBlock />)).toBe("");
    const bare = page(undefined, undefined);
    expect(bare).not.toContain("mailto:");
    expect(bare).not.toContain("Resident Grievance Officer:");
  });

  it("is configured from the environment, and a missing one is logged in production", () => {
    const env = read("src/config/env.ts");
    expect(env).toContain("export const grievanceOfficer");
    expect(env).toContain("GRIEVANCE_OFFICER_EMAIL are not set");
    expect(read(".env.example")).toContain("GRIEVANCE_OFFICER_NAME=");
    expect(read("deploy/docker-compose.yml")).toContain("GRIEVANCE_OFFICER_EMAIL");
  });
});

describe("legal note under every story", () => {
  it("carries the essentials and a link to the full page", () => {
    const html = renderToStaticMarkup(<LegalDisclaimer />);
    for (const ref of ["Article 19(1)(a)", "Section 52(1)(a)", "10bis", "17 U.S.C. § 107", "Section 356", "presumed innocent", "Sections 72 and 73", "POCSO"]) {
      expect(html, ref).toContain(ref);
    }
    expect(html).toContain('href="/legal-compliance"');
    expect(html).not.toContain("mailto:");
  });

  it("points complaints at the Grievance Officer when one is configured", () => {
    expect(renderToStaticMarkup(<LegalDisclaimer grievanceEmail="g@thebrief.example" />)).toContain('href="mailto:g@thebrief.example"');
  });

  it("is on every article page, directly below the sources", () => {
    const page = read("src/app/articles/[slug]/page.tsx");
    expect(page).toMatch(/<SourceList sources=\{article\.sources\} \/>\s*(\{\/\*[^}]*\*\/\}\s*)?<LegalDisclaimer grievanceEmail=\{grievanceOfficer\?\.email\} \/>/);
    expect(page.match(/<LegalDisclaimer/g)).toHaveLength(1);                    // once, not also further down
  });

  it("links to the page with the words 'Legal & Compliance'", () => {
    const html = renderToStaticMarkup(<LegalDisclaimer />);
    expect(html).toMatch(/<a [^>]*href="\/legal-compliance"[^>]*>Legal &amp; Compliance<\/a>/);
  });
});

describe("linking", () => {
  it("is in the footer's legal links", () => {
    expect(legalLinks.map((l) => l.href)).toContain("/legal-compliance");
  });

  it("is in the sitemap", () => {
    expect(read("src/app/sitemap.ts")).toContain('"/legal-compliance"');
  });
});
