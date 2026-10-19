import Image from "next/image";
import type { ArticleVideo } from "@/core/article";
import { cn } from "@/lib/cn";

/**
 * Native <video> in a WIDE 16:9 frame — zero JavaScript, so a Server Component is enough.
 *
 * Our videos are vertical (9:16). Dropped into a wide layout they'd be a thin strip, so the
 * frame fills the sides with a blurred, darkened copy of the poster — the usual news-site
 * treatment, and it costs nothing (no second render). A video that is already wide simply
 * fills the frame. `preload="none"` + poster means the page loads only the poster until play.
 */
export function VideoPlayer({ video, label, className }: { video: ArticleVideo; label: string; className?: string }) {
  const vertical = video.height > video.width;
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-card bg-navy", className)}>
      {vertical && (
        <Image
          src={video.poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          aria-hidden
          className="scale-125 object-cover opacity-45 blur-2xl"
        />
      )}
      <video
        controls
        playsInline
        preload="none"
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={label}
        className={cn("relative z-10 h-full", vertical ? "mx-auto w-auto" : "w-full object-contain")}
      >
        <source src={video.src} type="video/mp4" />
        Your browser can&apos;t play this video. <a href={video.src}>Download it</a>.
      </video>
    </div>
  );
}
