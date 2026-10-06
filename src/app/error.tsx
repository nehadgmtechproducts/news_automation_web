"use client";

// Error boundaries must be Client Components (React requirement).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="py-20 text-center">
      <h1 className="font-serif text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&apos;t load this page. Please try again.</p>
      <button type="button" onClick={reset} className="mt-6 rounded border border-line bg-surface px-4 py-2 font-medium">
        Try again
      </button>
    </section>
  );
}
