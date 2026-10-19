import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-page px-4 py-24 text-center">
      <h1 className="font-serif text-headline text-ink">Page not found</h1>
      <p className="mt-2 text-ink-muted">That story doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block text-brand hover:underline">Back to the latest stories</Link>
    </section>
  );
}
