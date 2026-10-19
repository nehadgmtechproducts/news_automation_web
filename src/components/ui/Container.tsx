import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The one page-width wrapper: max width and side gutters are defined here and nowhere else. */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn("mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>;
}
