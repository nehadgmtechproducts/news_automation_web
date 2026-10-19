"use client";

import { useActionState } from "react";
import { ArrowRightIcon, MailIcon } from "@/components/ui/icons";
import { initialSubscribeState, type SubscribeAction } from "@/core/subscribe";
import { cn } from "@/lib/cn";

/**
 * The newsletter banner above the footer. A Client Component only for the pending/success/error
 * feedback (useActionState); the form itself is a real <form> posting to a Server Action, so it also
 * works with JavaScript off. The action is passed in by the layout (the app layer) rather than
 * imported here, which keeps this file free of server code.
 */
export function NewsletterSignup({ action }: { action: SubscribeAction }) {
  const [state, formAction, pending] = useActionState(action, initialSubscribeState);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden rounded-card bg-linear-to-r from-brand-soft via-brand-soft/60 to-surface px-5 py-6 sm:px-8 lg:px-12 lg:py-8"
    >
      {/* soft wave, decoration only */}
      <svg aria-hidden="true" viewBox="0 0 600 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 text-brand opacity-[0.06]">
        <path d="M0 140 C 120 60, 240 200, 360 120 S 540 40, 600 90 V200 H0 Z" fill="currentColor" />
        <path d="M0 170 C 140 100, 260 210, 380 150 S 540 90, 600 130 V200 H0 Z" fill="currentColor" />
      </svg>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex items-center gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand/10 sm:size-[4.5rem]">
            <MailIcon className="size-8 text-brand sm:size-9" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id="newsletter-heading" className="font-serif text-title font-bold text-ink">Never miss a story</h2>
            <p className="mt-1 text-body text-ink-muted">Daily roundup of the biggest stories from around the world.</p>
          </div>
        </div>

        <form action={formAction} className="relative flex flex-col gap-3 sm:flex-row lg:w-full lg:max-w-xl">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <div className="relative min-w-0 flex-1">
            <MailIcon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-subtle" />
            {/* key: re-mount after an error so the address the visitor typed comes back */}
            <input
              key={state.email ?? "blank"}
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              defaultValue={state.email ?? ""}
              placeholder="Enter your email"
              aria-invalid={state.status === "error" || undefined}
              aria-describedby="newsletter-message"
              className="h-12 w-full rounded-control border border-line bg-surface pl-12 pr-4 text-body text-ink placeholder:text-ink-subtle focus:border-brand"
            />
          </div>
          {/* Honeypot: hidden from people, irresistible to form-filling scripts (see core/subscribe.ts). */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-control bg-brand px-7 text-body font-semibold text-ink-inverse transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            {pending ? "Subscribing…" : <>Subscribe <ArrowRightIcon className="size-5" /></>}
          </button>
        </form>
      </div>

      <p
        id="newsletter-message"
        role="status"
        aria-live="polite"
        className={cn("relative mt-3 text-small empty:hidden lg:text-right", state.status === "error" ? "text-live" : "text-success")}
      >
        {state.message}
      </p>
      <p className="relative mt-1 text-caption text-ink-subtle lg:text-right">We&apos;ll only use your email for the daily roundup.</p>
    </section>
  );
}
