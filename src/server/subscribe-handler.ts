import "server-only";
import { parseSignup, type SubscribeState } from "@/core/subscribe";

export type SubscribeDeps = {
  add(email: string, now: Date): Promise<"added" | "exists">;
  allow(ip: string): boolean;
  now?: () => Date;
};

const SUCCESS = "Thanks! You're on the list for the daily roundup.";

/**
 * The rules of the newsletter sign-up, apart from Next.js so they can be tested directly:
 *  - a filled honeypot looks like success but stores nothing;
 *  - an address that is already subscribed gets the SAME success message as a new one, so the form
 *    can't be used to find out who is on the list;
 *  - too many attempts from one address are refused with a plain message.
 */
export async function handleSubscribe(
  input: { email: unknown; website?: unknown; ip: string },
  deps: SubscribeDeps,
): Promise<SubscribeState> {
  const signup = parseSignup(input);
  if (signup.kind === "spam") return { status: "success", message: SUCCESS };
  if (signup.kind === "invalid") {
    return { status: "error", message: "Please enter a valid email address.", email: signup.email };
  }
  if (!deps.allow(input.ip)) {
    return { status: "error", message: "Too many attempts. Please try again in a little while.", email: signup.email };
  }
  try {
    await deps.add(signup.email, (deps.now ?? (() => new Date()))());
  } catch (err) {
    console.error(`[subscribe] could not save a sign-up: ${(err as Error).message}`);
    return { status: "error", message: "Something went wrong. Please try again.", email: signup.email };
  }
  return { status: "success", message: SUCCESS };
}
