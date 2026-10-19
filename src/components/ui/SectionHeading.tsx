import Link from "next/link";
import { cn } from "@/lib/cn";
import { ArrowRightIcon } from "./icons";

/** Section title with an optional "See all →" link. */
export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "See all",
  className,
}: {
  id?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 id={id} className="min-w-0 font-serif text-title text-ink">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-small font-semibold text-brand hover:text-brand-strong">
          {linkLabel} <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}
