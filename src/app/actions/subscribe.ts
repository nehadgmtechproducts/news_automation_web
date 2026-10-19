"use server";

import { headers } from "next/headers";
import type { SubscribeState } from "@/core/subscribe";
import { handleSubscribe } from "@/server/subscribe-handler";
import { signupLimiter, subscriberStore } from "@/server/subscribers";

/**
 * Newsletter sign-up. A Server Action, so the form works without JavaScript, and Next.js refuses
 * submissions that come from another origin (built-in CSRF protection). All the rules live in
 * server/subscribe-handler.ts.
 */
export async function subscribe(_previous: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return handleSubscribe(
    { email: formData.get("email"), website: formData.get("website"), ip },
    { add: (email, now) => subscriberStore.add(email, now), allow: (key) => signupLimiter.allow(key) },
  );
}
