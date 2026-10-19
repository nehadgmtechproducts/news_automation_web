import { categoryTheme } from "@/config/category-theme";
import type { CategoryName } from "@/core/categories";
import { cn } from "@/lib/cn";

/** Category label. `text` = coloured uppercase text (cards); `solid` = filled pill (over images). */
export function CategoryTag({
  category,
  variant = "text",
  className,
}: {
  category: CategoryName;
  variant?: "text" | "solid";
  className?: string;
}) {
  const theme = categoryTheme[category];
  return (
    <span
      className={cn(
        "text-label uppercase",
        variant === "text" ? theme.text : cn("inline-block rounded-control px-2 py-1 text-white", theme.bg),
        className,
      )}
    >
      {category}
    </span>
  );
}
