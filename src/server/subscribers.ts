import "server-only";
import { subscribersFile } from "@/config/env";
import { RateLimiter } from "./rate-limit";
import { FileSubscriberStore } from "./subscriber-store";

/** Composition root for the newsletter: the one place that picks a concrete store. */
export const subscriberStore = new FileSubscriberStore(subscribersFile);

/** 5 sign-up attempts per source per hour. */
export const signupLimiter = new RateLimiter(5, 3_600_000);
