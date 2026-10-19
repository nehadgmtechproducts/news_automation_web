import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** White rounded card surface used for sidebars and grouped content. */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-card bg-surface p-5 shadow-card", className)}>{children}</div>;
}
