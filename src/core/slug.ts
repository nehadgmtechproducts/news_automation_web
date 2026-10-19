/** "Technology / Privacy" -> "technology-privacy". Stable, URL-safe, lowercase. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "") // "What's" -> "whats", not "what-s"
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
