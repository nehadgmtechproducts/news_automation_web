import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-20 text-center">
      <h1 className="font-serif text-4xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">That story doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block text-accent hover:underline">Back to the latest stories</Link>
    </section>
  );
}
