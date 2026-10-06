/**
 * Server component that emits a JSON-LD <script>. Rendered in the initial HTML so crawlers
 * see it without executing JavaScript.
 *
 * `<` is escaped so a string like "</script><script>…" inside article data can never close
 * the tag early — the standard XSS guard for inline JSON.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
