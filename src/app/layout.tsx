import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/config/env";
import { subscribe } from "@/app/actions/subscribe";
import { NewsletterSignup } from "@/components/client/NewsletterSignup";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/seo/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: siteConfig.name, locale: siteConfig.locale },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f2f5fa", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.language} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-ink-inverse"
        >
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd(siteUrl)} />
        <JsonLd data={websiteJsonLd(siteUrl)} />
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer newsletter={<NewsletterSignup action={subscribe} />} />
      </body>
    </html>
  );
}
