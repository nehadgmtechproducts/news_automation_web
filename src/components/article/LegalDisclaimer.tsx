import Link from "next/link";

/**
 * The short legal note under every story. It repeats the essentials of /legal-compliance so each story carries
 * them, and points to the full page. The complaints address is the Grievance Officer's when one is configured.
 */
export function LegalDisclaimer({ grievanceEmail }: { grievanceEmail?: string }) {
  return (
    <aside aria-label="Legal and editorial note" className="mt-4 rounded-card bg-canvas p-4 text-caption text-ink-subtle">
      <p>
        <strong className="text-ink-muted">Legal and editorial note.</strong> This report is an independent news synthesis
        written from the publicly available reports linked above, published in exercise of the right to freedom of speech and
        expression under Article 19(1)(a) of the Constitution of India. Any third-party material is used only to report current
        events or for criticism or review, with the source acknowledged (Section 52(1)(a) of the Copyright Act, 1957; Article
        10bis of the Berne Convention; 17 U.S.C. § 107). Pictures marked as AI-generated are illustrations, not photographs of
        the event; a picture credited to an outlet is that outlet&apos;s photograph, shown with a link to its page; a &ldquo;file photo&rdquo; shows the subject, not the event, and is credited to its photographer under its free licence. Reports on crime or court matters rely on the public-good and court-reporting exceptions of Section 356 of
        the Bharatiya Nyaya Sanhita, 2023: anyone named as accused is presumed innocent until a court decides otherwise, and
        children and survivors of sexual offences are not identified (BNS Sections 72 and 73; POCSO Act, Section 23). For
        copyright queries, corrections or complaints,{" "}
        {grievanceEmail ? (
          <>write to our Grievance Officer at <a href={`mailto:${grievanceEmail}`} className="text-brand hover:underline">{grievanceEmail}</a> or </>
        ) : null}
        see <Link href="/legal-compliance" className="font-semibold text-brand hover:underline">Legal &amp; Compliance</Link>.
      </p>
    </aside>
  );
}
