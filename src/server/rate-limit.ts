import "server-only";

/**
 * Sliding-window limiter: at most `limit` hits per key within `windowMs`. In memory, so it resets
 * when the server restarts and is per-process — enough to stop one source hammering a form, not a
 * defence against a distributed attack. The clock is passed in so the rule is unit-tested.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  /** Records the attempt and returns true if it is allowed. */
  allow(key: string, now: number = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    this.hits.set(key, [...recent, now]);
    if (this.hits.size > 5000) this.prune(now);          // bound memory under a flood of distinct keys
    return true;
  }

  private prune(now: number) {
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= this.windowMs)) this.hits.delete(key);
    }
  }
}
