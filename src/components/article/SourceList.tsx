import type { Source } from "@/core/article";
import { formatDate } from "@/core/format";

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <section id="sources" aria-labelledby="sources-heading" className="mt-10 border-t border-line pt-6">
      <h2 id="sources-heading" className="font-serif text-title text-ink">Sources</h2>
      <ol className="mt-4 space-y-3">
        {sources.map((s) => (
          <li key={s.index} id={`source-${s.index}`} className="text-small">
            <span className="font-semibold text-ink">[{s.index}]</span>{" "}
            {/* nofollow + noopener: we cite these sources, we don't endorse them; no window.opener leak */}
            <a href={s.url} target="_blank" rel="nofollow noopener noreferrer" className="text-brand hover:underline">
              {s.title}
            </a>
            <span className="text-ink-subtle">
              {" "}— {s.domain}
              {s.publishedAt ? `, ${formatDate(s.publishedAt)}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
