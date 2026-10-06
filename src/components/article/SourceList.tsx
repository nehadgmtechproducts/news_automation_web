import type { Source } from "@/core/article";
import { formatDate } from "@/core/format";

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <section aria-labelledby="sources-heading" className="mt-10 border-t border-line pt-6">
      <h2 id="sources-heading" className="font-serif text-2xl font-semibold">Sources</h2>
      <ol className="mt-4 space-y-3">
        {sources.map((s) => (
          <li key={s.index} id={`source-${s.index}`} className="scroll-mt-24 text-sm">
            <span className="font-semibold">[{s.index}]</span>{" "}
            {/* rel: nofollow + noopener — we cite these, we don't endorse them; and no window.opener leak */}
            <a href={s.url} target="_blank" rel="nofollow noopener noreferrer" className="text-accent hover:underline">
              {s.title}
            </a>
            <span className="text-muted">
              {" "}— {s.domain}
              {s.publishedAt ? `, ${formatDate(s.publishedAt)}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
