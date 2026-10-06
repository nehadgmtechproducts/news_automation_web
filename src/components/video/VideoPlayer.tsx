import type { ArticleVideo } from "@/core/article";

/**
 * Native <video>: zero JavaScript, so a Server Component is enough.
 * `preload="none"` + a poster means the page weight is the poster image only; the
 * 8–10 MB video file is fetched when the reader presses play. Good for LCP and bandwidth.
 */
export function VideoPlayer({ video, label }: { video: ArticleVideo; label: string }) {
  return (
    <figure className="mx-auto w-full max-w-[320px]">
      <video
        controls
        playsInline
        preload="none"
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={label}
        className="aspect-[9/16] w-full rounded-lg bg-black object-cover"
      >
        <source src={video.src} type="video/mp4" />
        Your browser can&apos;t play this video. <a href={video.src}>Download it</a>.
      </video>
    </figure>
  );
}
