import type { Article } from "@/core/article";

/**
 * A made-up video, used only by tests. Published stories no longer carry videos (the backend makes
 * text + images only), so tests that need a video must not depend on whatever is currently published.
 */
export const sampleVideo: NonNullable<Article["video"]> = {
  src: "/media/sample/video-aaaa1111.mp4",
  poster: "/media/sample/poster-aaaa1111.jpg",
  width: 1080,
  height: 1920,
  durationSeconds: 41.5,
};

/** `base` with the sample video attached, under its own slug so it can sit beside the real stories. */
export const withSampleVideo = (base: Article): Article => ({ ...base, id: "sample-with-video", slug: "sample-with-video", video: sampleVideo });
