/**
 * The fixed content taxonomy. Mirrors `app/categories.py` in the content engine — keep the
 * two lists identical. The article schema accepts ONLY these names, so a story can never
 * appear under an invented heading, and every category has a stable URL.
 */
export const CATEGORIES = [
  { name: "Technology", slug: "technology", description: "AI, software, chips, cybersecurity and the technology industry." },
  { name: "Politics", slug: "politics", description: "Government, elections, courts, diplomacy, conflict and public policy." },
  { name: "Finance", slug: "finance", description: "Markets, earnings, the economy, currencies and crypto." },
  { name: "Entertainment", slug: "entertainment", description: "Movies, series, music, celebrities and sports." },
  { name: "Launches", slug: "launches", description: "New cars, bikes, phones, gadgets and other product launches." },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

/** Tuple form for z.enum(). */
export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as unknown as readonly [CategoryName, ...CategoryName[]];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function categoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name) ?? null;
}
