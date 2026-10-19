import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The Footer reads the contact email and social URLs from the server environment. These tests
 * swap that module for each case and render the real component to HTML, so "configured" and
 * "not configured" are both checked without restarting a server.
 */
async function renderFooter(env: { contactEmail?: string; showVideos?: boolean; socialUrls?: Record<string, string | undefined> }) {
  vi.resetModules();
  vi.doMock("@/config/env", () => ({
    contactEmail: env.contactEmail,
    showVideos: env.showVideos ?? false,
    socialUrls: { instagram: undefined, youtube: undefined, linkedin: undefined, x: undefined, ...env.socialUrls },
  }));
  const { Footer } = await import("@/components/layout/Footer");
  return renderToStaticMarkup(<Footer />);
}

afterEach(() => vi.doUnmock("@/config/env"));

describe("Footer rendering", () => {
  it("hides the Watch link while videos are off, and shows it when they are on", async () => {
    expect(await renderFooter({ showVideos: false })).not.toContain(">Watch<");
    expect(await renderFooter({ showVideos: true })).toContain(">Watch<");
  });

  it("with nothing configured: no Contact Us, no social icons, no empty links", async () => {
    const html = await renderFooter({});
    expect(html).not.toContain("Contact Us");
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain('aria-label="Follow us"');
    expect(html).not.toMatch(/href=""/);
    expect(html).not.toMatch(/href="#"/);
  });

  it("with an email: Contact Us is a mailto link to exactly that address", async () => {
    const html = await renderFooter({ contactEmail: "news@thebrief.example" });
    expect(html).toMatch(/<a [^>]*href="mailto:news@thebrief\.example"[^>]*>Contact Us<\/a>/);
  });

  it("shows an icon ONLY for the profiles that are configured, opening safely in a new tab", async () => {
    const html = await renderFooter({ socialUrls: { instagram: "https://instagram.com/thebrief", x: "https://x.com/thebrief" } });
    expect(html).toContain('href="https://instagram.com/thebrief"');
    expect(html).toContain('href="https://x.com/thebrief"');
    expect(html).not.toContain("youtube");
    expect(html).not.toContain("linkedin");
    expect((html.match(/aria-label="The Brief on /g) ?? []).length).toBe(2);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("has the copyright line with the current year, and the three legal links", async () => {
    const html = await renderFooter({});
    expect(html).toContain(`© ${new Date().getFullYear()} The Brief. All rights reserved.`);
    for (const label of ["Privacy Policy", "Terms of Use", "Cookie Preferences"]) expect(html).toContain(label);
  });

  it("does not claim 'expert analysis' or 'real-time' (we don't deliver either)", async () => {
    const html = await renderFooter({});
    expect(html.toLowerCase()).not.toContain("expert analysis");
    expect(html.toLowerCase()).not.toContain("real-time");
  });
});
