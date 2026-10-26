import Link from "next/link";
import { LegalSection } from "@/components/layout/LegalPage";

export type GrievanceOfficer = { name: string; email: string; address?: string };

/** The statutes and treaties this page refers to: one row per area, so the page and the reader see the same list. */
export const STATUTES: { area: string; law: string; provision: string; what: string }[] = [
  { area: "Freedom of the press", law: "Constitution of India", provision: "Article 19(1)(a) and 19(2)", what: "Freedom of speech and expression, subject to reasonable restrictions (sovereignty, public order, defamation, decency)." },
  { area: "Copyright in India", law: "Copyright Act, 1957", provision: "Section 52(1)(a)(ii) and (iii)", what: "Fair dealing for criticism or review, and for reporting current events and current affairs." },
  { area: "Defamation", law: "Bharatiya Nyaya Sanhita, 2023", provision: "Section 356 (Exceptions 1 to 4)", what: "Truth published for the public good, fair comment on public servants and public questions, and fair reports of court proceedings." },
  { area: "Victims and children", law: "Bharatiya Nyaya Sanhita, 2023; POCSO Act, 2012", provision: "BNS Sections 72 and 73; POCSO Section 23", what: "No disclosure of the identity of survivors of sexual offences or of children, and no publishing of certain court proceedings without permission." },
  { area: "Digital news publishers", law: "Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, as amended", provision: "Section 79; Part III of the Rules", what: "Publisher norms (Press Council of India code), a grievance mechanism, and disclosure of synthetically generated content." },
  { area: "International copyright", law: "Berne Convention; US Copyright Act; EU InfoSoc Directive (2001/29/EC)", provision: "Berne Articles 10 and 10bis; 17 U.S.C. § 107; Article 5(3)(c)", what: "Quotation, news reporting and fair use when dealing with outlets in other countries." },
];

/** Where the Grievance Officer goes, or an honest fallback. Never a placeholder. */
export function GrievanceBlock({ officer, contactEmail }: { officer?: GrievanceOfficer; contactEmail?: string }) {
  if (officer) {
    return (
      <dl className="rounded-card border border-line bg-surface p-4 text-body">
        <div><dt className="inline font-semibold">Resident Grievance Officer: </dt><dd className="inline">{officer.name}</dd></div>
        <div><dt className="inline font-semibold">Email: </dt><dd className="inline"><a href={`mailto:${officer.email}`} className="text-brand hover:underline">{officer.email}</a></dd></div>
        {officer.address && <div><dt className="inline font-semibold">Address: </dt><dd className="inline">{officer.address}</dd></div>}
      </dl>
    );
  }
  return contactEmail ? (
    <p>
      Write to us at <a href={`mailto:${contactEmail}`} className="text-brand hover:underline">{contactEmail}</a>.
    </p>
  ) : null;
}

/**
 * The body of /legal-compliance. It describes what this site actually does; where a rule is a promise about
 * practice (no victim names, no copied wording) the drafting rules and the human review behind it are named.
 * It is not legal advice, and the wording should be reviewed by a media or IP lawyer before launch.
 */
export function LegalComplianceContent({ name, officer, contactEmail }: { name: string; officer?: GrievanceOfficer; contactEmail?: string }) {
  return (
    <>
      <p>
        This page explains the laws and professional norms {name} works under, and what they mean for how we publish. It
        describes our practice. It is not legal advice.
      </p>

      <LegalSection title="1. Freedom of the press, and its limits">
        <p>
          {name} is an independent digital news publisher. We publish in exercise of the right to freedom of speech and
          expression under Article 19(1)(a) of the Constitution of India, and we stay within the reasonable restrictions in
          Article 19(2).
        </p>
      </LegalSection>

      <LegalSection title="2. How we use other outlets' reporting, and copyright">
        <ul>
          <li><strong>Facts are not copyrighted; wording is.</strong> Every story is written fresh from facts that at least two independent outlets report. We do not copy another outlet&apos;s sentences or structure.</li>
          <li><strong>We name our sources.</strong> Each story lists the outlets it was written from, with links, so readers can check them and the original reporters are acknowledged.</li>
          <li>
            <strong>Pictures.</strong> The picture at the top of a story is one of three things: a photograph taken from one of the story&apos;s own
            sources; a &ldquo;file photo&rdquo; of the person, organisation or place the story is about, taken from Wikimedia Commons under a free
            licence; or an AI-generated illustration (labelled, see section 4). A source photograph carries the source&apos;s name and a link to the
            page it came from, and is used to report the current event. A file photo is captioned &ldquo;File photo&rdquo; with the photographer,
            the licence and a link to its Commons page: it shows the subject, not the event, and only licences that allow this use are accepted
            (CC0, public domain and CC BY). Photographs are only cropped and resized. We do not use pictures supplied by news agencies or stock
            libraries (for example Getty Images, AP, Reuters or AFP), we never use a real photograph on a story about a sexual offence or a child,
            and we do not republish other outlets&apos; graphics or video.
          </li>
          <li><strong>Fair dealing.</strong> If we quote a short passage or use any third-party material, it is for reporting current events and current affairs, or for criticism or review, with the source acknowledged. This is permitted by Section 52(1)(a)(ii) and (iii) of the Copyright Act, 1957.</li>
          <li><strong>Other countries.</strong> For reporting from outlets abroad we rely on Articles 10 and 10bis of the Berne Convention, fair use under 17 U.S.C. § 107, and Article 5(3)(c) of the EU InfoSoc Directive (2001/29/EC).</li>
          <li>All trademarks and copyrights remain the property of their owners. If you own material you believe we should not use, tell us (section 6) and we will look at it promptly.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Crime, courts and defamation">
        <ul>
          <li><strong>Public good and fair comment.</strong> Our reporting relies on the exceptions to defamation in Section 356 of the Bharatiya Nyaya Sanhita, 2023 (Exceptions 1 to 4): true statements made for the public good, fair comment on the conduct of public servants and on public questions, and substantially true reports of court proceedings.</li>
          <li><strong>Presumption of innocence.</strong> When a story mentions an FIR, a charge sheet or an investigation, it reports an official record. Our drafting rules require that a person is described as accused or charged, never as guilty, until a court says so, and that allegations are attributed to the record they come from.</li>
          <li><strong>Victims and children.</strong> Our drafting rules forbid naming or otherwise identifying a child, or a survivor of a sexual offence, even if a source does. This follows Sections 72 and 73 of the Bharatiya Nyaya Sanhita, 2023 and Section 23 of the Protection of Children from Sexual Offences Act, 2012. A person reads every story before it is published. Because a drafting rule alone cannot be relied on, a story about a sexual offence, or about a child harmed in a crime, is also detected automatically and flagged to the reviewer, who is shown every person and place it names and must confirm that nobody identifiable is named before approving it.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Digital media rules, and AI-generated pictures">
        <ul>
          <li>As a publisher of news and current affairs content online we follow the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, as amended, which include the Norms of Journalistic Conduct of the Press Council of India and the Programme Code under the Cable Television Networks (Regulation) Act, 1995.</li>
          <li><strong>AI-generated pictures are labelled.</strong> Some story pictures are generated with AI to illustrate a subject. They are not photographs of the event. Each carries an &ldquo;AI-generated&rdquo; badge on the picture and the caption &ldquo;Illustration generated with AI&rdquo; under it on its story page.</li>
          <li><strong>AI-assisted writing is disclosed.</strong> Stories are drafted with AI assistance from the cited sources and reviewed by a person before publication. See our <Link href="/standards" className="text-brand hover:underline">editorial standards</Link>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Comments and reader content">
        <p>
          This website does not host reader comments. Where we publish on a platform that allows them, comments are the views
          of their authors, not ours, and we may ask for ones that break the law or the platform&apos;s rules to be removed. To
          the extent it applies to us, we rely on Section 79 of the Information Technology Act, 2000.
        </p>
      </LegalSection>

      <LegalSection title="6. Complaints and the Grievance Officer">
        <p>
          If you are a reader, a copyright holder or someone affected by a story, and you have a concern about attribution,
          accuracy or compliance, contact:
        </p>
        <GrievanceBlock officer={officer} contactEmail={contactEmail} />
        <p>We acknowledge complaints within 24 hours and resolve them within the timelines set by the IT Rules.</p>
      </LegalSection>

      <LegalSection title="Laws and treaties referred to">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-small">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="py-2 pr-4 font-semibold">Area</th>
                <th className="py-2 pr-4 font-semibold">Law</th>
                <th className="py-2 pr-4 font-semibold">Provision</th>
                <th className="py-2 font-semibold">What it covers</th>
              </tr>
            </thead>
            <tbody>
              {STATUTES.map((s) => (
                <tr key={s.area} className="border-b border-line align-top">
                  <td className="py-2 pr-4 font-medium">{s.area}</td>
                  <td className="py-2 pr-4">{s.law}</td>
                  <td className="py-2 pr-4">{s.provision}</td>
                  <td className="py-2">{s.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
    </>
  );
}
