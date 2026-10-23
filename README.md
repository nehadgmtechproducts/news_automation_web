# The Brief — news site

Public website for the Automated Content Engine. It renders the engine's sourced articles and 45-second videos across six categories (Technology, Politics, Finance, Entertainment, Launches, Healthcare), built so search engines get complete, fast, server-rendered HTML.

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

## Categories

`src/core/categories.ts` is the single list (mirrors `app/categories.py` in the engine). The article schema accepts only these names, the nav and `/category/<slug>` pages are generated from it, and every category has a page even before it has stories — empty ones show a message and are `noindex` and left out of the sitemap until they have content.

## Design system (change the look in one place)

| To change… | Edit | Notes |
|---|---|---|
| Colors (brand, text, surfaces, category colors) | `src/styles/tokens.css` | The default Tailwind palette is reset, so every color on the site must be a named token (`bg-brand`, `text-ink-muted` …). |
| Font sizes | `src/styles/tokens.css` | The type scale is **roles**, not pixel sizes: `text-hero`, `text-headline`, `text-title`, `text-heading`, `text-subtitle`, `text-body-lg`, `text-body`, `text-small`, `text-compact`, `text-caption`, `text-micro`, `text-label`. A role carries its size, line height and weight. |
| Typefaces | `src/config/fonts.ts` | Loads the font files with `next/font`; `tokens.css` maps them to `font-sans` / `font-serif`. |
| Radii, shadows, page width | `src/styles/tokens.css` | `rounded-card`, `shadow-card`, `max-w-page` (90rem: the design is ~1536px wide). Article body text is capped separately at 42rem so lines stay readable on a wide page. |
| Category colors / labels | `src/config/category-theme.ts`, `src/core/categories.ts` | Keep `core/categories.ts` identical to the engine's `app/categories.py`. |
| Nav and site text | `src/config/site.ts` | |

Reusable pieces live in `src/components/ui/` (`Container`, `Panel`, `Chip`, `ButtonLink`, `CategoryTag`, `SectionHeading`, icons). Components never hard-code a hex value or pixel size.

**Cover images.** `heroImage` is a *text-free* cover (`cover.jpg`) — the headline is real HTML drawn over it, so it is selectable and indexable. `socialImage` (`social.jpg`) is the titled card used only for link previews. Use a **new filename** when a cover changes: Next caches resized images by URL, so overwriting a file at the same URL keeps serving the old picture.

**Not built because there is no data for it:** accounts/notifications, email signup (an RSS link stands in).

## Videos (hidden for now)

The site is text + images. Videos are hidden by one setting, `SHOW_VIDEOS` (default `false`, in `.env`). While it is off:

- `server/articles.ts` strips `video` from every article as it is loaded (`withoutVideo()`), so no page, card, duration badge, sitemap video entry or `VideoObject` structured data can show one;
- the Watch row on the home page, the "Watch" menu and footer links, and the `/watch` page (404) are gone, and `/watch` is left out of the sitemap;
- the About / Standards pages stop mentioning videos, and the article's AI note stops mentioning a video.

**Nothing is deleted.** The video files and the `video` data stay in the content files, and the backend still renders videos and sends them in the Telegram approval card. Set `SHOW_VIDEOS=true` and restart to bring everything back. Caveat: the `.mp4` files under `public/media/` are still reachable by their exact URL, they just aren't linked from anywhere.

## Article page

Three columns at 1280px+ (outline | white article card | right panels); two at 1024px (the panels drop below); one on phones. Pieces: `Breadcrumbs` (Home › Stories › story › article; the story step is a link only once the story has a timeline page, and the same trail feeds the JSON-LD breadcrumb via `core/breadcrumbs.ts`), the dotted `OutlineNav`, the article card, `StoryTimelinePanel` (this story's updates by day with the one being read highlighted; **a one-update story shows "No later updates yet" and no links to a timeline page, because that page only exists from 2 updates**), and `RelatedStories` ("Related articles": other stories only, since this story's updates are already in the timeline).

Deliberately **not** copied from the design: the **bookmark** icon (saving articles in the browser would use localStorage, contradicting the cookie page's "no browser storage"; add accounts or server-side saving first) and the **"⋯" menu**; and the byline reads **"By The Brief · AI-assisted"**, not a human-sounding "Staff" byline. Timeline day headings are UTC dates ("Oct 7, 2026"), not "Today / Yesterday", which would need the visitor's clock and would go stale in a cached page.

## Footer and policy pages

The footer (`components/layout/Footer.tsx`, links from `config/footer.ts`) has the brand block and three columns: **Explore** (Latest News, Developing Stories, every category, Watch), **Edition** (every region) and **About** (About Us, Editorial Standards, Contact Us). It is built from the same category and region lists as the rest of the site, and `tests/footer.test.ts` fails if any footer link points at a page that doesn't exist. The legal row links to `/privacy`, `/terms` and `/cookies`; `/standards` and `/about` are the other policy pages (shared shell: `components/layout/LegalPage.tsx`).

Set in `.env` **before launch**:

| Variable | Effect |
|---|---|
| `CONTACT_EMAIL` | Shows "Contact Us" in the footer and the "email us" lines on the corrections and privacy pages. **Without it readers have no way to ask for a correction or data removal**; a build warning says so. |
| `SOCIAL_INSTAGRAM`, `SOCIAL_YOUTUBE`, `SOCIAL_LINKEDIN`, `SOCIAL_X` | Real profile URLs. Each icon appears only if its URL is set. |

**The policy pages describe what the site actually does, and must stay true.** `/privacy` and `/cookies` say the site sets no cookies, uses no browser storage, loads nothing from other companies' servers, and stores only anonymous read counts and newsletter addresses. If you add analytics, ads, an embedded video or a font from a CDN, update those pages first. They are a factual starting point written by the developers, **not legal advice: have `/terms` and `/privacy` reviewed before a public launch.**

## Home page sections and "See all"

"Latest news", "Watch" (only while `SHOW_VIDEOS=true`), "Developing stories" and "Most read today" are white cards (`Panel`), each with a "See all" link: `/latest` (newest first, **capped at the 48 newest: add pagination before the archive outgrows that**), `/watch`, `/stories` and `/most-read`. The Latest news cards are the narrow **compact** `ArticleCard` (16:9 thumbnail, 13px sans title clamped to 4 lines, stacked metadata). They share ONE grid definition (`CARD_ROW` in `components/home/HomeContent.tsx`) with the Watch cards, so the two rows are the same width at every screen size by construction: change the columns there and both follow. Latest news shows 5 stories to fill that 5-across row. Filter chips inside a card are the light grey-blue pills (`<Chip on="panel">`); chips on the page background keep the white outlined style.

**Image priority.** Next.js lazy-loads images by default; an above-the-fold image that is lazy delays the page's main paint (a Core Web Vitals / SEO cost). Every page therefore passes `priority` for its first row of covers (home hero, first 2-3 cards on `/latest`, `/category`, `/search`, `/most-read`, first 2 story rows). When adding a page with an image grid, do the same.

## Newsletter sign-up ("Never miss a story")

A banner above the footer on **every page** has an email box and Subscribe button (`components/client/NewsletterSignup.tsx`, placed by `app/layout.tsx` into the footer's `newsletter` slot) that posts to a **Server Action** (`app/actions/subscribe.ts`). Because it is a real `<form>` it also works with JavaScript off, and Next.js refuses submissions from other origins. The rules are in `server/subscribe-handler.ts`:

- **Validation** with zod (`core/subscribe.ts`): trimmed, lower-cased, max 254 characters; an invalid address returns a plain error and keeps what was typed.
- **No lookup:** an address that is already subscribed gets the *identical* success message, so the form can't be used to find out who is on the list.
- **Bots:** a hidden honeypot field; if it is filled the form looks successful but stores nothing. Plus 5 attempts per source per hour (in-memory, so it resets on restart: it stops one source hammering the form, not a distributed attack).
- **Storage:** `SUBSCRIBERS_FILE` (default `.data/subscribers.json`, git-ignored, file mode 600): serialised writes, atomic saves. A **corrupt file is never overwritten**: the sign-up errors out and the file is left for a human, because it holds people's addresses. One server process with a persistent disk only; for several servers or serverless, write another store with the same `add` method.
- `/privacy` tells readers what is stored and why.

**What does NOT exist yet:** sending. Nothing emails these people. Before the first roundup goes out you need an email provider, a confirmation email (double opt-in), an unsubscribe link in every message, and a decision on content and schedule. The success message therefore promises only "you're on the list", never a delivery date.

## Most read today

The home sidebar ranks stories by **real reads in the last 24 hours** (`core/reads.ts`, `server/reads.ts`).

- **What counts as a read:** a reader stays on an article for 5 seconds with the tab in front (`ReadBeacon`, a client component that posts to `/api/read`). Bots, link-preview fetchers and scripts are ignored, and one visitor counts once per article per day.
- **Honest, never padded:** the title is always "Most read today", and the list contains only stories that were actually read in the window, most-read first. With no reads yet the panel says "No reads yet today" instead of listing unread stories under a title that claims otherwise. Each edition page ranks only its own stories.
- **Privacy:** no cookies and no IP addresses or user agents stored. A visitor is a short hash of that day's random salt + IP + browser string, used only to avoid double-counting; salts and counts are deleted after 48 hours. `/about` tells readers this.
- **Endpoint safeguards:** same-origin only, user-agent filtered, slug must be a real article, tiny strictly-validated body; every valid request gets 204 so it reveals nothing.
- **Storage:** one JSON file (`READS_FILE`, default `.data/reads.json`, git-ignored): serialised writes, atomic saves, and a corrupt file just means "no reads yet". It needs ONE server process with a persistent disk. On serverless hosting or several servers, write another store with the same two methods (database/Redis) and change one line in `server/reads.ts`.
- The page refreshes the list at most once a minute (ISR). "See all" opens `/most-read` (the top 20; `noindex`, since it changes by the minute and is empty on a new site).

## Developing stories

A **story** is an ongoing subject; each article about it is an **update**. Articles carry `story: {key, label}` (assigned by the content engine, see its README) and the site groups on `story.key` (`src/core/stories.ts`).

- **Home panel** (`components/story/DevelopingStories.tsx`): stories with a tab for **every category** (Technology, Politics, Finance, Entertainment, Launches, Healthcare, in taxonomy order, via `storyTabs()`), each with its count, **0 included**, so the filter is the same on every visit; choosing an empty one says so. A round "‹" / "›" arrow appears on whichever side tabs are hidden (`scrollEdges()`), and disappears when that end is reached. Then the newest story expanded, each with a day-grouped timeline. A client component only for the tab state; every timeline is in the server HTML (native `<details>`), so crawlers see it all. It is handed slim `StorySummary` objects, never whole articles.
- **`/stories`** lists every story; **`/stories/<key>`** is the full timeline. Only a story with **2+ updates** has a timeline page; a one-update story links straight to its article (and its `/stories/<key>` URL redirects there), so one piece of content never has two URLs. Timeline pages are in the sitemap; one-update stories are not.
- **"Live"** appears (after load, from the visitor's clock) only for a story with 2+ updates whose newest is under 24 hours old. It is never in cached HTML, so a cached page can't claim a story is live after it went quiet.
- Times on timelines are **UTC** on purpose, so the server and every browser print identical text.

## Editions (regions)

`src/core/regions.ts` is the list (mirrors `app/regions.py` in the engine): Global, Asia, Europe, Americas, Middle East, Africa. Each article has exactly one `region`, chosen by the engine's drafting step. The Edition bar links to `/` (Global) and `/edition/<slug>`.

- **Rule:** a regional edition shows its own stories **plus the Global ones**; the Global edition shows everything. So an edition is never empty and never hides worldwide news.
- `/edition/global` redirects (308) to `/`. An edition with no stories of its own is `noindex` and left out of the sitemap, since it would only repeat the Global page.
- Stories written before regions existed have no region; the exporter gives them `Global`.

## Content contract

Articles are `content/articles/<slug>.json`, validated by `src/core/article.ts` (`schemaVersion: 1`). Media lives in `public/media/<slug>/{hero.jpg,poster.jpg,video.mp4}`. A file that fails validation is **skipped and logged**, never rendered half-broken. Key rules: ≥ 2 sources, `category` ∈ the taxonomy, `region` ∈ the editions, `metaDescription` ≤ 200 chars, lowercase-hyphen `slug`, ISO timestamps, `[n]` citations must reference real sources (tested).

Backend (content-engine) → web mapping: `title`/`dek`/`sections`/`keyTakeaways`/`whyItMatters` from the draft; `sources[]` from the scraped articles; `video` from `media/<id>/final.mp4` (+ first frame as poster); `category` normalized to a single value (`"Technology / Privacy"` → category `Technology`, keyword `Privacy`).

**Adding a story:** drop the JSON + media in place and redeploy (or let ISR pick it up if content is read from disk at runtime). No code changes.

## Security notes
No `dangerouslySetInnerHTML` for content: article text is parsed to a typed tree and rendered by React. The only raw injection is JSON-LD, with `<` escaped. Outbound source links use `rel="nofollow noopener noreferrer"`.

## Known follow-ups
- MP4s are git-ignored; serve them from object storage/CDN in production (and set `video.src` to the absolute CDN URL — the schema currently requires a site-relative path).
- `/about` states stories are human-reviewed; make sure that's true before launch.
- Content in `content/articles` is whatever the backend has published (stories approved in Telegram). Older stories can be deleted at any time: remove the story's JSON and its `public/media/<slug>/` folder.

## Committing published stories automatically

Every approved story arrives as new files in `content/articles` and `public/media`. You do not need to commit
them by hand: `scripts/publish-content.sh` commits and pushes **only** those folders (never your code, staged or
not) and does nothing when there is nothing new. A commit is called `Publish N stories` and lists the headlines.

```bash
./scripts/publish-content.sh                     # once, now
./scripts/auto-publish-macos.sh watch            # every 5 minutes, while this Terminal window is open
./scripts/auto-publish-macos.sh install          # every 5 minutes in the background (see the note in the script about ~/Documents)
```

It waits for the backend to finish writing a story, skips if you are not on `main`, runs one at a time, and
if someone pushed code in the meantime it rebases its commit on top and pushes again. Tests:
`tests/publish-content.test.ts` (real throwaway git repos). On the server see `deploy/README.md`.
