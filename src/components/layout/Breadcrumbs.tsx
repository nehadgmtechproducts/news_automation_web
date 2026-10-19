import Link from "next/link";
import type { BreadcrumbItem } from "@/core/breadcrumbs";

/** The visible trail. The last step is the current page; steps without a page are plain text. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-small">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-subtle">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex min-w-0 items-center gap-2">
              {last ? (
                <span aria-current="page" className="truncate text-ink-muted sm:max-w-md">{item.name}</span>
              ) : item.path ? (
                <Link href={item.path} className="text-brand hover:underline">{item.name}</Link>
              ) : (
                <span>{item.name}</span>
              )}
              {!last && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
