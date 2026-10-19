import type { CategoryName } from "@/core/categories";

/**
 * Presentation per category. Class names are written out in full (not built from strings)
 * so Tailwind can see them. The colors themselves live in styles/tokens.css.
 */
export const categoryTheme: Record<CategoryName, { text: string; bg: string }> = {
  Technology: { text: "text-cat-technology", bg: "bg-cat-technology" },
  Politics: { text: "text-cat-politics", bg: "bg-cat-politics" },
  Finance: { text: "text-cat-finance", bg: "bg-cat-finance" },
  Entertainment: { text: "text-cat-entertainment", bg: "bg-cat-entertainment" },
  Launches: { text: "text-cat-launches", bg: "bg-cat-launches" },
};
