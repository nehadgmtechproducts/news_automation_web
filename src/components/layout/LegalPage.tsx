import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Shared shell for the plain-text policy pages (standards, privacy, terms, cookies, about). */
export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <Container className="py-10">
      <article className="prose-brief mx-auto max-w-2xl text-body-lg text-ink">
        <h1 className="font-serif text-headline">{title}</h1>
        {updated && <p className="mb-8 mt-2 text-small text-ink-subtle">Last updated {updated}</p>}
        {children}
      </article>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 mt-8 font-serif text-title">{title}</h2>
      {children}
    </section>
  );
}

/** "Email us at x." — rendered only when a real address is configured (see config/env.ts). */
export function ContactSentence({ email, lead = "Email us at" }: { email?: string; lead?: string }) {
  if (!email) return null;
  return (
    <p>
      {lead} <a href={`mailto:${email}`} className="text-brand hover:underline">{email}</a>.
    </p>
  );
}
