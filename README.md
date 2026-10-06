# The Brief — news site

Public website for the Automated Content Engine. It renders the engine's sourced articles and 45-second videos, built so search engines get complete, fast, server-rendered HTML.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · zod · vitest

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm test
SITE_URL=https://your-domain.com npm run build && npm start
```

> **`SITE_URL` is read at build time.** Static pages bake canonical, Open Graph, sitemap and JSON-LD URLs in when they are generated. A production build without it warns and falls back to `http://localhost:3000`.

---

## Architecture

Dependency direction is one-way, and ESLint enforces it (`no-restricted-imports`, see `eslint.config.mjs`):

```
core  <-  server | seo | components  <-  app (routes)
```

| Layer | Path | Rule |
|---|---|---|
| **core** | `src/core` | Framework-free domain: zod `Article` schema, safe body parser, formatters. Only imports zod. Unit-tested in plain Node. |
| **config** | `src/config` | `site.ts` (brand, nav — safe anywhere). `env.ts` (`server-only`, validated env). |
| **server** | `src/server` | `server-only` data layer. `ArticleRepository` interface → `FileArticleRepository` (JSON in `content/`) → `articles.ts` composition root with React `cache()`. Swap to a DB/CMS by implementing the interface. |
| **seo** | `src/seo` | Pure metadata and JSON-LD builders, plus the `<JsonLd/>` server component. |
| **components** | `src/components` | Server Components by default. `client/` holds the only two Client Components. |
| **app** | `src/app` | Routes. The only layer that fetches data and passes it down as props. |

### Server vs client — the SEO rule

**Everything is a Server Component unless it needs state, events or browser APIs.** Server Components render to HTML on the server, so crawlers see the headline, body, links, meta tags and JSON-LD without running JavaScript, and the browser downloads less JS.

Client Components (`"use client"`) here, and why:
- `MobileNav` — open/closed state. Links are still in the server HTML.
- `ShareButton` — `navigator.share` / clipboard.
- `app/error.tsx` — React requires error boundaries to be client components.

Not client components, on purpose: the video player (native `<video>`, `preload="none"` + poster), dates (formatted in UTC to avoid hydration mismatches), article body and citations.

### Rendering strategy
- `/`, `/watch`, `/category/*` — static, ISR every 60 s.
- `/articles/[slug]` — pre-rendered via `generateStaticParams`, ISR every 5 min; unknown slugs → real 404.
- `/about` — fully static. `sitemap.xml`, `robots.txt`, `feed.xml` — generated routes.

## SEO checklist (all implemented)
Unique `<title>` + meta description per page (title template) · canonical URLs · Open Graph + Twitter cards · JSON-LD `NewsArticle`, `VideoObject` (ISO-8601 duration), `BreadcrumbList`, `WebSite`, `NewsMediaOrganization` · XML sitemap with image **and video** entries · `robots.txt` · RSS · one `<h1>` per page, semantic landmarks, skip link · `next/image` (hero preloaded, rest lazy, responsive sizes) · `next/font` (no layout shift) · no hard-coded "N sources" claims — the badge is computed from real data · honest AI-use disclosure on `/about` and each article.

## Content contract

Articles are `content/articles/<slug>.json`, validated by `src/core/article.ts` (`schemaVersion: 1`). Media lives in `public/media/<slug>/{hero.jpg,poster.jpg,video.mp4}`. A file that fails validation is **skipped and logged**, never rendered half-broken. Key rules: ≥ 2 sources, `metaDescription` ≤ 200 chars, lowercase-hyphen `slug`, ISO timestamps, `[n]` citations must reference real sources (tested).

Backend (content-engine) → web mapping: `title`/`dek`/`sections`/`keyTakeaways`/`whyItMatters` from the draft; `sources[]` from the scraped articles; `video` from `media/<id>/final.mp4` (+ first frame as poster); `category` normalized to a single value (`"Technology / Privacy"` → category `Technology`, keyword `Privacy`).

**Adding a story:** drop the JSON + media in place and redeploy (or let ISR pick it up if content is read from disk at runtime). No code changes.

## Security notes
No `dangerouslySetInnerHTML` for content: article text is parsed to a typed tree and rendered by React. The only raw injection is JSON-LD, with `<` escaped. Outbound source links use `rel="nofollow noopener noreferrer"`.

## Known follow-ups
- MP4s are git-ignored; serve them from object storage/CDN in production (and set `video.src` to the absolute CDN URL — the schema currently requires a site-relative path).
- `/about` states stories are human-reviewed; make sure that's true before launch.
- Sample content is two real stories from the engine; the Apple story is ~3 days old and shouldn't be presented as "breaking".
