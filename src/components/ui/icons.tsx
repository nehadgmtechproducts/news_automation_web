import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/** Small inline icon set. Decorative by default (aria-hidden); size with text-* / size-* classes. */
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      // shrink-0 is ALWAYS applied: a caller's className replaces the default size, and without
      // this an icon in a flex row gets squeezed narrower than it is tall.
      className={cn("shrink-0", className ?? "size-4")}
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>
);
export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.5 3 3 5-6" /></Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const MenuIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);
export const ShareIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 13v6h14v-6" /></Svg>
);
export const RssIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12a7 7 0 0 1 7 7" /><path d="M5 5a14 14 0 0 1 14 14" /><circle cx="6" cy="18" r="1" /></Svg>
);
export const PlayIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z" /></Svg>
);
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></Svg>
);
export const MailIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6.5L20.5 7" /></Svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>
);
export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></Svg>
);
export const YoutubeIcon = (p: IconProps) => (
  <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" /></Svg>
);
export const LinkedinIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V16M8 7.8v.2M12 16v-5.5M12 12.5c0-1.4 1-2 2-2s2 .7 2 2.2V16" /></Svg>
);
export const XIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 4l16 16M20 4 4 20" /></Svg>
);
