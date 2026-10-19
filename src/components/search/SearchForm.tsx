import { cn } from "@/lib/cn";
import { SearchIcon } from "@/components/ui/icons";

/**
 * A plain GET form to /search — works with no JavaScript, and is what a crawler can follow.
 * `id` must be unique per instance (the header has a desktop and a mobile one).
 */
export function SearchForm({
  id,
  defaultValue = "",
  className,
}: {
  id: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <form role="search" action="/search" method="get" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">Search stories</label>
      {/* The magnifier is the submit button, so clicking or tapping it searches (Enter works too). */}
      <button
        type="submit"
        aria-label="Search"
        className="absolute inset-y-0 left-0 grid w-9 place-items-center rounded-l-control text-ink-subtle hover:text-brand"
      >
        <SearchIcon className="size-4" />
      </button>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search news, topics…"
        className="w-full rounded-control border border-line bg-canvas py-2 pl-9 pr-3 text-small text-ink placeholder:text-ink-subtle focus:border-brand focus:bg-surface"
      />
    </form>
  );
}
