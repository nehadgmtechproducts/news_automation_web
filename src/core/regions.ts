/**
 * Website editions (regions). Mirrors `app/regions.py` in the content engine — keep the two lists
 * identical. Every article carries exactly one region; the Edition bar filters on it.
 *
 * Rule: a regional edition shows its OWN stories plus the Global ones (so it is never empty and
 * never hides worldwide news); the Global edition shows everything.
 */
export const REGIONS = [
  { name: "Global", slug: "global", description: "Everything, worldwide." },
  { name: "Asia", slug: "asia", description: "Asia and the Pacific, plus the stories that matter worldwide." },
  { name: "Europe", slug: "europe", description: "Europe, plus the stories that matter worldwide." },
  { name: "Americas", slug: "americas", description: "North, Central and South America, plus the stories that matter worldwide." },
  { name: "Middle East", slug: "middle-east", description: "The Middle East, plus the stories that matter worldwide." },
  { name: "Africa", slug: "africa", description: "Africa, plus the stories that matter worldwide." },
] as const;

export type RegionName = (typeof REGIONS)[number]["name"];

/** Tuple form for z.enum(). */
export const REGION_NAMES = REGIONS.map((r) => r.name) as unknown as readonly [RegionName, ...RegionName[]];

export function regionBySlug(slug: string) {
  return REGIONS.find((r) => r.slug === slug) ?? null;
}

/** Where an edition lives: Global is the home page, the others are /edition/<slug>. */
export function editionPath(region: (typeof REGIONS)[number]): string {
  return region.name === "Global" ? "/" : `/edition/${region.slug}`;
}

/** Stories shown in an edition (see the rule above). */
export function filterByEdition<T extends { region: RegionName }>(items: T[], edition: RegionName): T[] {
  return edition === "Global" ? items : items.filter((a) => a.region === edition || a.region === "Global");
}

/** Does this edition have stories of its own (not just the Global ones everyone shares)? */
export function hasOwnStories<T extends { region: RegionName }>(items: T[], edition: RegionName): boolean {
  return edition === "Global" ? items.length > 0 : items.some((a) => a.region === edition);
}
