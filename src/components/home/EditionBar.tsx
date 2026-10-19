import { Chip } from "@/components/ui/Chip";
import { GlobeIcon } from "@/components/ui/icons";
import { REGIONS, editionPath, type RegionName } from "@/core/regions";

/**
 * "Edition: Global · Asia · Europe …". Real links to real pages (/ and /edition/<slug>), so the
 * choice works without JavaScript and every edition is crawlable. On a phone the row scrolls
 * sideways instead of wrapping.
 */
export function EditionBar({ active }: { active: RegionName }) {
  return (
    <nav aria-label="Edition" className="flex items-center gap-3">
      <span className="flex shrink-0 items-center gap-2 text-small font-medium text-ink-muted">
        <GlobeIcon className="size-5" /> Edition:
      </span>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        {REGIONS.map((r) => (
          <li key={r.slug}>
            <Chip href={editionPath(r)} active={r.name === active}>{r.name}</Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}
