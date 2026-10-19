import { z } from "zod";

/** What the newsletter form shows. Plain data so it can cross from the server action to the browser. */
export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
  /** Echoed back on error so the visitor doesn't have to retype their address. */
  email?: string;
};

export const initialSubscribeState: SubscribeState = { status: "idle", message: "" };

/** The server action's shape, defined here so components can type a prop without importing app code. */
export type SubscribeAction = (previous: SubscribeState, formData: FormData) => Promise<SubscribeState>;

const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export type ParsedSignup = { kind: "ok"; email: string } | { kind: "spam" } | { kind: "invalid"; email: string };

/**
 * Validate a sign-up. `website` is a honeypot: a field real visitors never see (it is hidden), so
 * any value in it means a script filled the form in. Spam is reported separately so the caller can
 * pretend it worked — telling a bot it was caught only teaches it.
 */
export function parseSignup(input: { email: unknown; website?: unknown }): ParsedSignup {
  if (typeof input.website === "string" && input.website.trim() !== "") return { kind: "spam" };
  const raw = typeof input.email === "string" ? input.email : "";
  const parsed = emailSchema.safeParse(raw);
  return parsed.success ? { kind: "ok", email: parsed.data } : { kind: "invalid", email: raw.trim().slice(0, 254) };
}
