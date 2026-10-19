import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-brand text-ink-inverse hover:bg-brand-strong",
  secondary: "border border-line bg-surface text-ink hover:border-line-strong",
  inverse: "bg-white text-ink hover:bg-brand-soft",
} as const;

/** Link styled as a button (navigation, not an action — so it is an <a>, not a <button>). */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-control px-5 py-2.5 text-small font-semibold transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
