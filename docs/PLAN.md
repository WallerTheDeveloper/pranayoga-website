# Prana Yoga Studio Essen: build the redesign (Next.js + Payload)

## Context
The client's WordPress site is being replaced with a custom site. The design is a Claude Design canvas
(`https://claude.ai/code/artifact/eb6c0d98-8147-41aa-9e3e-b2cea6b5a6f3`, 35 artboards):
- a direction sheet and component boards;
- 17 responsive pages (desktop 1440 and phone 390 are the same page; container queries at 1180/960/700);
- about 76 image assets in the canvas asset store.

The design expects an admin panel for prices, dates, price blocks, course texts, schedules, reviews,
contact data, WhatsApp links, downloads and legal texts.

`D:\pranayoga-website` is empty, so this build sets up the conventions.

The design files (`project/*.dc.html`, `project/canvas.json`) and image assets are read from that canvas with the Artifact tool (`read` with `path`/`paths`; assets by `/_blob/<id>`). They're not stored in this repo.
The shared CSS for the whole site is in the `<helmet><style>` of each `.dc.html`. `project/Komponenten.dc.html` and `project/Main.dc.html` hold the spec.

## Decisions (agreed)
- **Stack:** Next.js (App Router) + Payload 3, PostgreSQL via `@payloadcms/db-postgres`, TypeScript strict, pnpm (`corepack enable pnpm`).
- **Styling:** global `tokens.css` + `base.css`, one CSS Module per component. Port the design's CSS 1:1 where possible.
- **Naming:** English for every code identifier: files, components, functions, variables, types, CSS classes and custom properties, Payload collection/global/field slugs, seed keys. German appears only in user-facing text: site copy, admin labels (`{ de, en }`) and public URL slugs. The mapping table is below.
- **Local DB:** PostgreSQL in Docker Compose (Docker 29 is installed).
- **Media storage:** the server's own disk, no extra service. See "Media & file storage".
- **Admin:** German and English UI (`i18n.supportedLanguages: { de, en }`, fallback `de`). Every custom label is `{ de, en }`. The public site is German only.
- **Roles:** one role for now: every admin user can do everything. Access checks go through helpers in `src/access/`, so an `editor` role can be added later without reworking the collections. See "Access & permissions".
- **Drafts:** versions + drafts + Live Preview on content collections and globals.
- **Caching:** public pages are served from the server cache; publishing in the admin clears the affected pages immediately. See "Caching".
- **Empty admin fields:** the element is hidden or falls back gracefully, never a dashed box on the live site.
- **Open client items** (WhatsApp group link, the teacher's wa.me link, Instagram/Facebook URLs, legal texts, teacher-training texts): seeded with the design's placeholders as editable fields.
- **Seed:** a script loads all design copy and images into Payload.
- **URLs:** `trailingSlash: true` to match the WordPress URLs. The 301s (`/kurse/yin-yoga/` → `/kurse/tibetische-klangschalen/`, `/kurse/kinder-yoga/` → `/kurse/yoga-fuer-jugendliche/`) live in the admin-only Redirects collection (`@payloadcms/plugin-redirects`), seeded.
- **Fonts:** self-hosted with `next/font/google` (files downloaded at build and served from our domain; no request to Google at runtime). Fraunces needs the `SOFT`, `WONK` and `opsz` axes. Fallback: `next/font/local`.
- **No cookie banner** until something needs consent.
- **Map:** Google Maps embed on the Kontakt page, loaded only after a "Karte laden" click (two-click consent). Before that, no request goes to Google. The Datenschutz page needs a Google Maps paragraph; flag this to the client. See "Map".
- **Forms:** UI only for now (validation, error summary, success state, stubbed submit).
- **Motion:** all in phase 3.
- **Deployment:** first a temporary staging server on DigitalOcean for the client's review, then the OVH VPS for launch (decided 2026-11-14). See "Hosting".
- **Git:** read-only git only. No commits, branches or pushes until the user says so.
- **Testing:** full rules: TDD, 80% coverage, Vitest (unit, component, Payload integration against a test DB) and Playwright + `@axe-core/playwright`.

## Naming map (design term → code identifier)
| Design (German) | Code (English) |
|---|---|
| Leinen / Sand / Ton / Rosé | `--color-linen` / `--color-sand` / `--color-clay` / `--color-rose` |
| Moos / Moos hell / Logo-Grün | `--color-moss` / `--color-moss-light` / `--color-logo-green` |
| Tinte / Tinte 2 | `--color-ink` / `--color-ink-muted` |
| Terrakotta (+ dunkel) | `--color-terracotta` / `--color-terracotta-dark` |
| Startseite, Über uns, Kurse, Kontakt | `HomePage`, `AboutPage`, `CoursesPage`, `ContactPage` |
| Mitgliedschaft & Preise, Anmeldeformular | `PricingPage`, `SignupFormPage` |
| Yogaausbildung(en) | `TeacherTraining…` (`TeacherTrainingPill`, `TeacherTrainingTeaser`, global `teacher-training`) |
| Kurse-Dropdown | `CoursesDropdown` |
| Kurszeiten | `CourseSchedule`, field `schedule[]` |
| Für wen / Schritte / Wirkungen | `audience` / `steps[]` / `benefits[]` |
| Preisgruppe / Preis-Block | collection `price-groups`, `PriceGroup` / `PriceBlock` |
| Probestunde | `trial` (`isTrial`) |
| Kontoinhaber / Verwendungszweck | `accountHolder` / `paymentReference` |
| Bewertungen / Stimmen | collection `reviews`, `ReviewList` |
| Impressum / Datenschutz | global `legal-notice` / `privacy-policy` |
| Studio settings / Technik | global `business-settings` / `technical-settings` |
| Prana-Band, WhatsApp-Band | `PranaBand`, `WhatsAppBand` |
| Fehler 404 | `NotFoundPage` (`not-found.tsx`) |

## Routing: English folders, German public URLs (decided)
Route folders are English (`app/(site)/courses/[slug]/page.tsx` …).

**One source of truth:** `src/lib/routes.ts` defines each route once, with its internal path, its public German path and a typed href builder such as `routes.course(slug)`. Everything reads from it:
- the `rewrites()` and `redirects()` in `next.config`;
- every `<Link>` and breadcrumb;
- the sitemap;
- Payload Live Preview URLs.

| Public URL (German) | Internal route (English) |
|---|---|
| `/` | `/` (home) |
| `/kurse/`, `/kurse/:slug/` | `/courses/`, `/courses/:slug/` |
| `/mitgliedschaft-preise/` | `/pricing/` |
| `/anmeldeformular/` | `/signup/` |
| `/ueber-uns/` | `/about/` |
| `/yogaausbildungen/` | `/teacher-training/` |
| `/kontakt/` | `/contact/` |
| `/impressum/` | `/legal-notice/` |
| `/datenschutz/` | `/privacy-policy/` |

- **Rewrites:** each German URL is served internally from the English route.
- **Redirects:** each English URL 301s to its German twin, so Google never sees a page twice. `redirects()` only checks the incoming URL, never the rewritten one, so there's no loop. Verify this together with `trailingSlash: true` in E2E tests.
- **Untouched:** `/admin` and `/api` (Payload).
- **Course slugs:** content, not code; German and stored in Payload (`hatha-yoga`, `tibetische-klangschalen` …).

## Content strategy (client hasn't decided what to edit)
Pages never read Payload directly. They call a repository layer in `src/content/`, for example:
- `getBusinessSettings()`
- `getCourses()` / `getCourse(slug)`
- `getPriceGroups()`
- `getReviews()`
- `getTeacherTraining()`
- `getPageCopy('home')`

Each function returns a typed object.
- **In Payload now:** exactly what the design's admin notes name. Prices, dates, deadlines, durations, discounts; price groups and blocks; bank details; course texts; schedules; reviews; contact data; WhatsApp and social links; downloads; legal texts; the teacher-training entry.
- **In typed German copy modules for now** (`src/content/copy/home.ts` …): everything else, such as hero headlines, section intros and FAQ wording. They sit behind the same functions.
- **Later:** when the client decides, promoting a text to the admin means adding the field in Payload and changing one repository function. Components don't change. No page builder unless the client asks for one.

## Access & permissions (one role for now)
Every admin user can do everything. Anonymous visitors can only read published content.
- **Helpers** in `src/access/`: `isLoggedIn`, `publishedOrLoggedIn` (anonymous reads get published docs only) and `nobody`. Every collection and global uses them instead of inline access logic.
- **Admin nav groups** (labels de/en): Inhalte/Content · Preise/Prices · Einstellungen/Settings · Technik/Technical. Technik holds `users`, `technical-settings` and `redirects`, with a description saying these are technical.
- **Course URL slugs:** made from the title on every save until the course is first published, then locked, also after unpublishing (`src/fields/slug.ts`). The admin shows the slug read-only.
  - The admin autosaves a new course before its title is typed, so "set on create" alone left the slug empty and blocked publishing (fixed on 2026-11-12).
  - Changing a published slug goes through us: a script with `context: { allowSlugChange: true }` plus a 301 in Redirects.
- **Secrets** stay in env, never in the DB.

**Guardrails** (validation hooks):
- Required fields.
- Max lengths on headlines and teasers so the layout holds.
- Prices are numbers ≥ 0.
- WhatsApp links must start with `https://chat.whatsapp.com/` or `https://wa.me/`.
- IBAN checksum.
- At most one trial block across all published price groups. "Exactly one" can't be enforced: moving the trial to another group passes through zero or two. With none marked, the trial offer is hidden.
- Image minimum size per tier and required alt text.
- Media that's still in use can't be deleted.
- The last user can't be deleted.

**Later: an `editor` role**, if the client's account should lose the technical side. Add `role: admin|editor` to `users` and a role check to the helpers. Admin-only then: users and roles, `technical-settings`, redirects, hard-deleting courses and media, and Payload's system collections. The editor keeps all business content, drafts and publishing, and their own account.

## Caching (decided)
Visitors always get pages from the server cache. A publish in the admin clears exactly the affected entries right away; the next request renders the fresh content and caches it again.
- **Cached content layer:** every function in `src/content/` is cached and tagged, with no time-based expiry; only the admin hooks clear entries. Use the tagged-cache API that the scaffolded Next version supports together with Payload (`'use cache'` + `cacheTag`, or `unstable_cache` with `tags`); confirm with docs-lookup at scaffold time.
- **Pages** render on the first request and are served from the cache after that. Course pages too: `generateStaticParams` returns an empty list, so the Docker build doesn't need the database. Pages never read cookies or headers, which would make them dynamic; `pnpm build` output must list every public route as static/ISR.
- **Tags:** one per collection or global (`business-settings`, `technical-settings`, `courses`, `price-groups`, `reviews`, `teacher-training`, `downloads`, `legal-notice`, `privacy-policy`, `redirects`, `media`), plus `course:<slug>` for a single course. The site layout reads `business-settings` and `courses` (header dropdown, footer), so changing either refreshes every page.
- **Invalidation:** one helper, `revalidateContent(tags)`, called from `afterChange` and `afterDelete` hooks on every collection and global.
  - It fires only when the public version changes: publish, unpublish, delete. Draft saves and autosaves leave the cache alone.
  - Changing a course slug clears both the old and the new `course:<slug>` tag.
  - Content functions that return images also carry the `media` tag, so replacing an image or editing its alt text refreshes the pages that show it.
  - Expiry is immediate, not stale-while-revalidate, so no visitor sees the old version after a publish (on Next 16: `revalidateTag(tag, { expire: 0 })`; confirm at scaffold).
  - The seed script and migrations pass `context.disableRevalidate`, since they run outside Next.
- **Drafts:** Live Preview and preview links use Draft Mode, which skips the cache. Editors see drafts; visitors never do.
- **Images:** media URLs carry the doc's `updatedAt` as a version (`?v=…`), so a replaced file never comes from a stale `next/image` or browser cache.
- **Dates:** if a page shows something that depends on today's date (for example, whether the early-bird deadline has passed), that entry also expires once a day.

## Media & file storage (decided)
Uploads live on the server's own disk, next to the app. No S3, no CDN, no extra service or cost.
- **Folders:** Payload's `upload.staticDir` points to `uploads/media/` (images) and `uploads/downloads/` (PDFs) at the project root. Git and the Docker build context ignore `uploads/`.
- **Production:** the app ships as a Docker image, so there's no repo checkout on the server. The same `uploads/` folder sits next to `docker-compose.yml` on the VPS (for example `/srv/pranayoga/uploads/`) and is bind-mounted into the app container, so redeploys and image rebuilds never touch it. Postgres keeps its data in a volume on the same disk.
- **Image sizes:** Payload generates the `feature`, `card` and `small` sizes with sharp on upload; `next/image` serves them as WebP and caches the results in `.next/cache/images`.
- **Serving:** files go out through Payload (`/api/media/file/…`) with `next/image` in front. If that ever gets busy, Caddy can serve the folder directly.
- **Limits:** JPEG, PNG and WebP for images, PDF for downloads; 15 MB per file. Space isn't a concern: the ~76 design images plus their sizes stay well under 1 GB of the VPS's 40 GB.
- **Backups:** see "Hosting".
- **Later:** if the site outgrows the disk, `@payloadcms/storage-s3` replaces local storage without code changes elsewhere.

## Map (decided)
Google Maps on the Kontakt page, behind a two-click consent.
- **`MapConsent`** (client): a still placeholder with the address and a "Karte laden" button. Only the click inserts the Google Maps iframe; before that, no request goes to Google. The choice isn't stored, so there's nothing for a cookie banner to cover.
- **Embed URL** comes from `technical-settings`.
- **Datenschutz:** needs a Google Maps paragraph. Flag this to the client, since the legal texts come from them.
- **Considered and dropped:** hosted OpenFreeMap (visitors' IP addresses still reach its servers, so it needs a Datenschutz paragraph too) and a self-hosted OpenStreetMap map (no paragraph, but more work).

## Phase 0: plan doc + command guard hook (before any other work) ✅ done

**Status:** done on 2026-11-11.
- The hook lives in `.claude/settings.json` and `.claude/hooks/guard-commands.mjs`. The rules are in `.claude/hooks/guard/`.
- Run the tests with `node --test ".claude/hooks/**/*.test.mjs"`. Node 24 doesn't take a folder here.
- The hook fails closed: if the script can't start or throws, the command is blocked.
First, write this plan to `docs/PLAN.md` in the repo; it's the living plan doc from then on.

Then set up the guard hook with the `update-config` skill.
- Project-level `.claude/settings.json`.
- A `PreToolUse` hook on `Bash|PowerShell` that runs `node .claude/hooks/guard-commands.mjs`.
  - The script reads the tool input JSON from stdin.
  - It exits 2 with a reason on stderr to block.
  - Its tests use `node --test` (no dependencies).

Blocked:
- **Git:** everything except an allowlist of read-only commands: `status log diff show blame ls-files ls-tree rev-parse describe shortlog grep cat-file`, plain or listing `branch`/`remote`/`tag`, and `config --get/--list`.
- **Destructive file operations:** recursive deletes (`rm -r`, `Remove-Item -Recurse`, `rmdir /s`, `del /s`) unless every target resolves inside the project and isn't the project root or `.git`. The same applies to `find … -delete` and `find … -exec rm`, checked against each search root. Also blocked: `format`, `diskpart`, `mkfs`, `dd of=`, `shred`, `Format-Volume`, `Clear-Disk`.
- **System:** `shutdown`, `reboot`, `Stop-`/`Restart-Computer`, `reg add/delete`, `setx`, `Set-ExecutionPolicy`, `net user`, `sc delete`, recursive `chmod`/`chown`/`icacls`/`takeown`.
- **Piped remote code:** `curl|wget … | sh/bash`, `iwr|irm … | iex`.
- **Outward-facing:** `npm/pnpm publish`, `docker push`, `gh` write subcommands, `ssh`/`scp`/`rsync` to remote hosts.
- **Data destruction:** `docker system/volume prune`, `docker volume rm`, `docker compose down -v` / `rm -v`, `dropdb`, SQL `DROP DATABASE/TABLE|TRUNCATE` via `psql`, and `payload migrate:fresh|reset|refresh|down`. The same checks run inside `docker (compose) exec|run`.

This is a guardrail against mistakes, not a security sandbox.

## Phase 1: foundation, shell, home page → review ✅ done

**Status:** built on 2026-11-12; signed off on 2026-11-14.
- **Versions:** Next 16.4.6, Payload 3.93.0, React 19.3.1. Content cache: `unstable_cache` with tags and no expiry; the hooks expire tags with `revalidateTag(tag, { expire: 0 })`.
- **Unpublish detection:** Payload passes the latest *version* as `previousDoc`, which is a draft after any draft save. So a `beforeChange` hook reads the stored main document first (`src/cache/hooks.ts`). Collections and globals wire the hooks through `collectionCacheHooks` / `globalCacheHooks`, so the two halves can't drift apart.
- **Hooks run before the DB commit**, but inside a route handler or server action Next only queues the tags and applies them after the handler returns. So no request can cache the old data in between.
- **Next's data cache** (`.next/cache/fetch-cache`) survives rebuilds, because entries are keyed by the loader's source text. `scripts/clear-data-cache.mjs` runs before `pnpm build` and at the end of the seed. A running server keeps entries in memory, so restart it after a re-seed.
- **Footer year:** the site layout re-renders once a day (`revalidate = 86400`); content reads stay cached.
- **Uploads:** `MEDIA_DIR` (a relative folder, default `uploads/media`; the tests use `uploads/test-media`). Payload renames an upload whose file name already exists on disk, so each environment needs its own folder.
- **Media URLs:** Payload's `withPayload` turns on trailing slashes, so upload URLs end in `/`. `localMediaPath` strips it; otherwise the image optimizer gets a 308.
- **Seed:** refuses `NODE_ENV=production` and any database not on this machine (override: `SEED_ALLOW_REMOTE_DB=true`). A re-run resets seeded content to the design copy and publishes it. `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` optionally create the admin.
- **Admin session cookie** is `Secure` whenever `NEXT_PUBLIC_SERVER_URL` is https.
- **Tests:** 242 unit and integration tests (coverage 96% statements, 91% branches) and 31 E2E tests (desktop at 1440, Pixel 7 at 390).
  - E2E always resets the test DB, seeds, builds and starts the server on :3100 (`reuseExistingServer: false`).
  - E2E waits with `tests/e2e/settle.ts` instead of `networkidle`: prefetches of pages that don't exist yet answer 404 and keep their body open, so the network never goes idle. Re-check after Phase 3.
- **Review:** two code-reviewer passes (front end, back end). Fixed: 1 HIGH (an unpublish after a draft save didn't clear the cache), 7 MEDIUM, 7 LOW. One MEDIUM (cache expiry inside the transaction) doesn't apply, see "Hooks run before the DB commit". The rest are listed below and under the later phases.
- **Open, needs the client:** WhatsApp group link, social links, prices (the trial heading shows "Probestunde" without a price), bank account holder and payment reference. `noindex` stays on until launch.
- **Notes:**
  - `next dev` writes `AGENTS.md` into the project root (Next 16.4); `agentRules: false` in `next.config` turns that off.
  - The command guard blocks `pnpm format`, because it reads "format" as the Windows drive command. Use `pnpm exec prettier --write .` or narrow the rule.
  - The last-admin guard counts, then deletes, so two admins deleted at the same instant could both pass.
  - Integration suites share state within a file, and the wipe leaves globals in place.

1. **Scaffold** with `create-payload-app` (blank, Postgres) at the version current at build time; check APIs with docs-lookup / Context7.
   - `docker-compose.yml` (postgres + a test DB).
   - `.gitignore` and `.dockerignore` exclude `uploads/` (see "Media & file storage").
   - `.env.example` (`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET`), validated at startup with zod.
   - ESLint/Prettier, Vitest, Playwright.
   - `src/lib/routes.ts`, plus the `next.config` rewrites/redirects generated from it (see "Routing").
2. **Design tokens and base CSS** (`src/styles/`):
   - English tokens per the naming map, plus error `#9B2C2C` and field border `#8A7D72`.
   - Type scale (desktop/mobile), easing variables, `.paper` grain, focus ring.
   - Container-query breakpoints 1180/960/700; reduced-motion defaults.
3. **Static brand assets:** logo SVGs (horizontal and stacked) and the grain tile go to `public/brand/`.
   - Source assets: `/_blob/378a…` (horizontal), `/_blob/d267…` (stacked), `/_blob/d9a5…` (grain).
   - Download with the Artifact tool (`read` with `path` = asset id; the list continues past the first 50).
4. **Icons** (`src/components/icons/`):
   - The 6 course icons (48 grid, 1.75 stroke, from `Main.dc.html` §05): `HathaIcon`, `BackIcon`, `SingingBowlIcon`, `TeensIcon`, `WheelIcon`, `SportBalanceIcon`.
   - UI icons: arrow, WhatsApp, phone, mail, menu, close, chevron, Instagram, Facebook, certificate, zoom.
5. **UI primitives** (`src/components/ui/`):
   - Buttons: `WhatsAppButton` (terracotta, WhatsApp only), `Button` (variants dark/outline/light), `Chip`, `TextLink`, `SocialButton`.
   - Small parts: `Tag`, `Eyebrow`, `IconDisc`, `Card`.
   - Images: `TreatedImage` (the 3-layer photo recipe with hover zoom) and `ContainedImage`.
   - Admin values: `AdminValue` (renders nothing when empty), `Section` (+ paper variant).
6. **Shell** (`src/components/layout/`):
   - `ContactBar` (phone, email, address, socials) and sticky `SiteHeader` (nav, `CoursesDropdown` with hover/focus and a 0.2 s close delay, `TeacherTrainingPill`, `WhatsAppButton`).
   - Full-screen `MobileMenu` (courses listed inline) and `MobileActionBar` (Termin / Anrufen / E-Mail; switches to the personal chat on the teacher-training page).
   - `SiteFooter` and `Breadcrumbs`.
7. **Payload schema** (`src/collections`, `src/globals`, `src/access/`, following "Access & permissions"):
   - `users` (auth, last-user guard; no role field yet).
   - `media` in `uploads/media/` (alt text required; sizes `feature` 600×760, `card` 440×660, `small` 330, each at 1.5×).
   - `courses`: slug, icon, tagline, badge, cardTeaser, hero, audience, steps[], benefits[], schedule[] (optional weekday/start/end), faqs[], order, SEO.
   - `price-groups`: kicker, title, description, order, blocks[]. Each block has name, badge none/popular/promo, highlighted, price, unit, inclusions[], action signup/whatsapp, `isTrial`, `showInSignupForm`.
   - `reviews`.
   - `business-settings` global (editor).
   - `technical-settings` global (site URL, default SEO/OG image, `noindex` switch, feature flags for the loader and a future cookie banner, Google Maps embed URL) and `redirects` via `@payloadcms/plugin-redirects` (seeded with the WordPress 301s).
   - All with drafts, versions and Live Preview, plus the cache hooks from "Caching".
   - The cached repository functions in `src/content/` (see "Content strategy" and "Caching").
8. **Seed** (`seed/manifest.json` + `seed/seed.ts`):
   - The manifest maps each blob id to an English file name, German alt text (taken from the design's `<img alt>`) and the pages that use it.
   - The script uploads the images and creates courses, price groups, reviews and settings from the design copy.
9. **Home page:** hero, course grid, "Neu im Studio", `TeacherCard` with seals, `PranaBand`, `ReviewList` (stacked), trial offer + `WhatsAppBand`, footer.
10. **Tests:**
    - Unit: repository mappers, `AdminValue`, price/date formatting, access rules.
    - Integration, against the test DB: access rules via the Local API with `overrideAccess: false` (anonymous reads only published docs and can't write; a logged-in user can do everything), the guardrail validations, and the cache hooks (which change clears which tags; draft saves clear nothing).
    - E2E: nav, dropdown via keyboard, mobile menu at 390, axe on the home page, visual check at 1440 and 390 against the boards.
    - E2E caching: publish a change, and the next page load shows it; a repeat load is a cache hit.
    - E2E privacy: no page requests a third-party host (the Kontakt map is covered in phase 3).
    - E2E routing: each German URL returns 200; each English URL 301s to the German one; links use the German URLs.
    - Unit: `routes.ts` href builders and the generated rewrite/redirect tables.
11. Review with the code-reviewer agent and fix CRITICAL/HIGH issues.

## Phase 2: courses overview + course template ×6 → review ✅ done

**Status:** built on 2026-11-12; signed off on 2026-11-14.
- **Routes:** `/kurse/` is static (re-rendered daily like every page). `/kurse/[slug]/` has `generateStaticParams` returning `[]`, so each course renders on its first visit and then stays cached until a publish. Unknown slugs get a 404.
- **`teacher-training` global:**
  - Fields: `startMonth` (month picker), `price`, and `teaser` {`heading`, `text`, `facts` (up to 3 value/label rows), `priceNote`}.
  - Drafts with autosave; the `teacher-training` tag. The teaser shows the price as its last fact and uses "Gesamtpreis" when the note is empty (confirmed on 2026-11-12).
  - Seeded from the design copy. Start month and price stay empty ("[Monat Jahr]" and "[Preis]" in the design).
  - Preview opens `/kurse/` until the page exists in phase 3.
- **Price on a course page:** a price block has an optional `course` relationship. The first linked block that has a price shows in that course's hero ("Yoga für Jugendliche: 45 € · Alle Preise"). The seed links the Jugend-Yoga block, but its price is still empty, so nothing shows yet.
- **"Weitere Kurse":** automatic, with no admin field. It shows the three courses nearest in admin order (the earlier one wins a tie), listed in admin order. This matches the design on 5 of 6 pages. Jugendliche shows Rücken, Klangschalen and Rad Yoga instead of the design's Hatha, Rücken and Klangschalen. Confirmed on 2026-11-12.
- **Template variants:**
  - Hero frame by photo orientation: 3:2, or 2:3 for portrait photos.
  - Audience with or without a photo.
  - Steps with or without photos.
  - Benefits as photo cards plus a ticked list, with an optional side photo.
  - The schedule sits inside the trial panel. With no trial offer it gets its own panel (not in the design), and it is hidden while empty. Confirmed on 2026-11-12.
- **From the Phase 1 review, done:** `getCourse` checks the slug against `getCourses()` before it touches the per-slug cache entry.
- **404s in the route cache — decided A (2026-11-12); restart follow-up decided (a), built in the hosting phase:**
  - Next caches the 404 render of every unknown `/kurse/<slug>/`. With default settings it is written to `.next/server/route-cache` (about 100 KB per slug), so random URLs grow the disk. The entry is tagged `courses`, so a later publish of that slug clears it.
  - `next.config.ts` now sets `experimental.isrFlushToDisk: false`. Route and data cache live only in the 50 MB in-memory LRU. Verified: a repeat unknown slug is a memory `HIT` and nothing is written to disk. The 64 E2E tests still pass, including publish-then-reload.
  - Side effects:
    - `scripts/clear-data-cache.mjs` becomes a harmless no-op, because data-cache files on disk are no longer read.
    - Verified side effect: after a server restart, pages prerendered at build (`/`, `/kurse/`) serve their build-time HTML as a cache hit until the daily re-render. Edits published after the last deploy disappear from those pages until then. Next keeps its cleared-tags list only in memory, and with A the newer render was never on disk. Course pages are not affected; they render fresh after a restart.
  - Follow-up, decided (a) on 2026-11-12: a secured route handler that marks every cached page stale, called by the container start script before the warm-up. It is built in the hosting phase (see "Hosting").
- **Fixed after the gate (2026-11-12): new courses could not be published.** The slug was only generated on create, but the admin's first autosave creates an untitled draft. Now the slug follows the title until the first publish; see "Course URL slugs". Duplicating a course gives the copy `<slug>-copy`, and the slug then follows the new title. Covered by integration tests (autosave flow, untitled drafts, lock after unpublish, duplicate, script rename) and two admin-UI E2E tests (new course; duplicate, rename, publish, then the URL answers 200).
- **Tests:**
  - 318 unit and integration tests (after the slug fix; 312 at the gate) (coverage 97% statements, 92% branches).
  - 66 E2E tests (64 at the gate, plus 2 admin-UI tests). They cover every course rendering with breadcrumbs, canonical and related courses; FAQ toggling by mouse and keyboard; the schedule hidden when empty and shown after a publish; 404 on repeat visits; and a course-page cache hit. axe runs on the overview and all six courses, plus screenshots at 1440 and 390.
- **Review:** one code-reviewer pass found 0 CRITICAL and 0 HIGH issues.
  - Fixed: M1 (assert the course-page cache tags, plus a comment), M2 (course grids are now `ul`/`li`), M3 (duplicate "Kurszeiten" label in the no-trial panel).
  - M4 is confirmed; see the open item above.
  - L2 (draft-mode auth runs once per content read during admin preview) could be memoised with React `cache()`. It only affects preview. L5 is already covered.
- **Notes:**
  - Heading accents no longer auto-hyphenate inside a name ("Es-sen-Borbeck").
  - After schema changes the dev DB needs a push (`pnpm dev` once) before `pnpm build`, which prerenders `/` against it.
  - The dev DB has the new schema but not the new seed data. `pnpm seed` fills the teaser and the Jugend-Yoga link, but it resets admin edits.

- `CoursesPage`: hero, photo cards, "Was benötige ich?", `TeacherTrainingTeaser`, trial offer.
- `CoursePage` (`[slug]`): one template with hero, audience, steps, benefits, optional `CourseSchedule`, `TeacherCard`, `TeacherTrainingTeaser`, `FaqList` (`details`/`summary`), related courses.
- Add the `teacher-training` global, which the teaser needs (price, start month, facts).
- Breadcrumbs, `generateStaticParams`, metadata.
- Tests for each piece (E2E: every course renders, FAQ toggles, schedule hidden when empty).
- **From the Phase 1 review:** `getCourse` caches `null` for any well-formed unknown slug under `course:<slug>`, with no expiry. Before the course route goes live, check the slug against `getCourses()` first, so random URLs can't grow the cache.

## Phase 3: remaining pages, forms, motion → review ✅ done

**Status:** built on 2026-11-13; signed off on 2026-11-14. The user committed it ("phase 3 complete").
- **Pages:** Über uns, Yogaausbildungen, Mitgliedschaft & Preise, Anmeldeformular, Kontakt, Impressum, Datenschutz and the 404 page are all static, re-rendered daily and cleared on publish. `error.tsx` and `global-error.tsx` use the 404 layout with a reload link.
- **New content types:**
  - `downloads` collection: PDF only. A tag says where a file is used (e.g. the contract on the pricing page), and each tag may be used once.
  - `legal-notice` and `privacy-policy` globals: Lexical, with drafts and an "updated on" date.
  - `teacher-training` gains weekends, topics, requirements, certification and a flyer.
  - The schema is pushed to the dev DB. The new seed data is not, because `pnpm seed` resets admin edits.
- **Decisions made while building:**
  - **Forms send nothing (as decided).** The signup and contact forms validate on submit and show an `ErrorSummary` that takes focus. The signup form also checks the IBAN checksum. Without JavaScript the send button stays disabled with a `noscript` note.
  - **No plan, no form.** If no price block is marked for the signup form, the page shows a note and the WhatsApp group instead of a form nobody could send.
  - **Bank fields.** Choosing "Überweisung" hides the bank fields, and their errors leave the summary.
  - **Legal placeholders.** A block that still contains a `[placeholder]` is hidden, and the page says the text is being prepared. The seed fills both pages with placeholders, so both show that note today.
  - **Redirects:**
    - Old addresses answer 308, because Next's `permanentRedirect` uses 308. Search engines treat it like a 301.
    - The admin refuses a redirect to its own address and one that would close a loop (A → B → A).
    - A stored self-redirect is ignored at read time and answers 404.
    - Publishing a redirect clears the cached 404 of that address.
  - **Known Next quirk.** On the first render of an old course address (the cache miss), Next sends the `Location` header twice with the same value. Cached hits send it once. Browsers accept identical copies; the E2E test checks every copy.
  - **404 title.** The 404 routes throw `notFound()` from `generateMetadata` too. Otherwise the client swapped "Seite nicht gefunden" for the default title after hydration.
  - **Sitemap and robots.** The sitemap is empty while `noindex` is on. robots.txt then blocks everything; with it off, it allows `/`, blocks `/admin/`, `/api/` and `/next/`, and names the sitemap.
  - **Intro loader.** It is built but off: `featureFlags.introLoader` is seeded false. The E2E test switches it on, checks that it runs once per session, and switches it off again.
  - **Motion.** All motion is off under `prefers-reduced-motion`. E2E runs with reduced motion, except the motion spec.
  - **Certificate buttons.** Their accessible name starts with the visible "Vergrößern" (axe `label-content-name-mismatch`).
- **Fixed on the way:**
  - Phase 3's stylesheets changed the CSS Module load order, so the header CTA stopped hiding at ≤700 px and covered the menu button. It is now scoped to `.actions` (higher specificity).
  - The Kontakt details list put icons straight into `dl`, which is invalid. The icon now sits inside the `dt`.
- **Tests:**
  - 437 unit and integration tests (coverage 97.5% statements, 91.7% branches).
  - 163 E2E tests, all passing. They cover:
    - every new page answering 200 with its heading and canonical, and no visible placeholders
    - forms: all errors at once, summary links, IBAN checksum, the transfer switch, success focus, and the no-JS state
    - the lightbox: wrap-around, focus trap, Escape returns focus
    - the map: no Google request before "Karte laden"
    - 404s, old-URL redirects, and a redirect replacing a cached 404
    - sitemap and robots with `noindex` on and off
    - motion, including reduced motion and the intro flag
    - the no-JS mobile menu
    - axe on every page, with errors shown and the lightbox open
    - screenshots at 1440 and 390
- **Review:** one code-reviewer pass found 0 CRITICAL and 0 HIGH issues.
  - Fixed:
    - the summary keeps hidden bank fields
    - the signup form has no plans to offer
    - redirect loops
    - `safeHref` accepted backslash and control characters in paths
    - the IBAN copy button did not reset after a failed copy
    - the sitemap was filled under `noindex`
    - a dead class on legal sections
  - Left as is: the intro loader stays behind its flag. One low note was justified as built.
- **Open client items (before launch):**
  - Google Maps embed URL (Kontakt shows only the route link until it is set)
  - Impressum and Datenschutz texts
  - teacher-training dates, prices, texts and certification, plus the flyer PDF
  - the contract PDF (the pricing page hides the download until one is uploaded)
  - the WhatsApp group invite link
  - sending the forms by email (needs the email adapter)

**Decided before the start (2026-11-12):**
- **Forms stay UI only in Phase 3.** Anmeldeformular and Kontakt validate and show a success state but send nothing. Sending (email through a Payload email adapter, which "forgot password" needs too) is a before-launch item.
- **Mobile menu without JavaScript:** until hydration, the menu button is a plain link to an anchor at the footer navigation, which already lists every page. After hydration it opens the dialog as today.
- **Error pages:** `error.tsx` and `global-error.tsx` reuse the 404 layout (`Fehler-404.dc.html`) with their own German copy, "Etwas ist schiefgelaufen", and a reload link. The design has no separate board for them.
- **`AboutPage`:** gallery and certificate `Lightbox` (keyboard, focus trap, counter).
- **`TeacherTrainingPage`:** "Fragen per WhatsApp" opens the personal chat; `MobileActionBar` switches.
- **`PricingPage`:** price groups; signup steps; `downloads` collection (contract); bank details with `IbanCopyButton`.
- **`SignupFormPage`** (UI only):
  - Fieldsets 1–3; the plan select is fed by blocks with `showInSignupForm`.
  - Payment radio cards that toggle the IBAN fields; consent checkbox.
  - Validation on submit; an `ErrorSummary` that takes focus and links to each field; success state; IBAN checksum validation.
- **`ContactPage`:** UI-only form; `MapConsent` with the Google Maps embed loaded after a click (see "Map"). E2E: no request to Google before the click, the iframe after it.
- **Legal pages and 404:** `legal-notice` and `privacy-policy` as rich-text (Lexical) globals; `NotFoundPage`.
- **Sitemap and robots.**
- **Error pages (from the Phase 1 review):** `global-error.tsx` and `error.tsx` with German copy and a reload link, in the 404 layout (see "Decided before the start"). Today a database outage shows Next's default 500 page.
- **Mobile menu without JavaScript (from the Phase 1 review):** the menu button needs hydration. Until then it links to the footer navigation (see "Decided before the start").
- **Motion:**
  - `ScrollReveal`: fade over 0.7 s, rise 28 px over 1 s, 80 ms stagger, plays once.
  - First-visit `IntroLoader` (≤1.2 s) and 240 ms page crossfade (View Transitions).
  - Prana breath ring (8 s cycle).
  - Everything off under `prefers-reduced-motion`.
- Tests and code review.

## Phase 4: staging on the DigitalOcean droplet → review ⏳ planned, not started

The setup decisions are under "Hosting" → "Staging on DigitalOcean first". The user runs every step on the droplet and in GitHub: the command guard blocks `ssh`, `scp` and `docker push` here, and git stays read-only. `docs/DEPLOY.md` (step 10) is the runbook for those steps.

1. **Production build:** `output: 'standalone'` in `next.config.ts`. A Dockerfile packages the build made in CI: Node 24, a non-root user, sharp. Add a health route (`/next/health`) that answers 200 once the database responds.
2. **Migrations:** create the first Payload migration in `src/migrations/` and run it when the app starts (Payload's `prodMigrations`; confirm with docs-lookup). Dev keeps the schema push. From now on, every schema change ships with `pnpm payload migrate:create`.
3. **Build in CI against a throwaway Postgres** that only the migrations have built (no push). `pnpm build` prerenders pages from the database, so this also proves the migrations are complete.
4. **Startup refresh and warm-up** (decided in Phase 2):
   - A secured route handler marks every cached page stale: a secret from env, constant-time compare, POST only, rate-limited.
   - The container's start script calls it, then a warm-up requests every public page.
   - The warm-up builds its own URL list from the routes and the published courses, because the sitemap stays empty under `noindex`.
   - Both call `localhost` inside the container, so the shared login doesn't block them.
5. **Staging compose file:**
   - App plus Postgres. Postgres sits on an internal network only, and the app listens on `127.0.0.1:<free port>`.
   - Memory limits on both containers, and Postgres tuned small (`shared_buffers`, `max_connections`).
   - `uploads/` is bind-mounted.
   - Restart policies, and log rotation so logs can't fill the 25 GB disk.
6. **Proxy:** a site block for the sslip.io hostname, with the shared login (basic auth), HTTPS from Let's Encrypt and `X-Robots-Tag: noindex`. It goes into the proxy the droplet already uses for 80/443, or a Caddy we add if there is none.
7. **Deploy script on the droplet** (`deploy.sh`):
   - Pulls the new image, restarts the app and waits for the health route.
   - Keeps the previous image for rollback and prunes older ones.
   - The SSH key GitHub uses can run only this script (`restrict,command=` in `authorized_keys`).
8. **GitHub Actions** (`.github/workflows/deploy.yml`), on push to `master`:
   - Lint, typecheck, unit + integration tests, and E2E against a Postgres service.
   - Then the build, the image pushed to GHCR, the deploy over SSH and a smoke test through the shared login.
   - One deploy at a time. The image is pulled with the job's own token, so the droplet stores no long-lived GitHub token.
9. **Data:**
   - Export and import scripts: a `pg_dump` plus an `uploads/` archive. They do the first load (a fresh local seed → staging) and later the move (staging → OVH).
   - After the first load the seed never runs on staging (its guard already refuses non-local databases).
   - Nightly backups on the droplet, keeping 7, plus an off-site copy (where it goes is open).
10. **Runbook** `docs/DEPLOY.md`: one-time droplet setup, GitHub secrets, first load, deploy, rollback, restore and the OVH move.
11. **Tests and review:**
    - Unit tests for the refresh route (secret, method, rate limit) and the warm-up URL list.
    - A CI run on a branch before the first real deploy.
    - Then code-reviewer and security-reviewer passes.
    - Verify on the droplet: admin login, Live Preview and uploads behind the shared login; memory under load (`docker stats`).

## Verification
- `docker compose up -d db`, then `pnpm seed`, then `pnpm dev`.
- Open `/` and `/admin`. Log in; switch the admin language between de and en; save a draft and preview it (the public page doesn't change), then publish it (the public page shows it on the next load).
- `pnpm test --coverage` (≥80%) and `pnpm e2e` (Playwright, Chromium + mobile viewport, axe with no serious violations).
- Compare Playwright screenshots at 1440 and 390 side by side with the matching artboards.
- `pnpm build` succeeds (prod build) and lists every public route as static/ISR.
- No page contacts a third-party host; the only exception is Google Maps on Kontakt, after the "Karte laden" click.
- `node --test ".claude/hooks/**/*.test.mjs"` passes; a blocked command such as `git commit` is refused by the hook.

## Hosting (decided; a later phase)
Stay on OVH. The client keeps her Web Hosting plan for the domain and email, and buys a VPS-1 (2 vCores, 4 GB, 40 GB NVMe) when we reach the hosting phase. That server runs Docker Compose (app + Postgres + Caddy), with images built in CI. Uploads are bind-mounted from the server's disk, and Postgres uses a volume on the same disk (see "Media & file storage"). Nightly backups (`pg_dump` plus `uploads/`) go to the client's existing OVH Web Hosting space, so no new service is needed. After each deploy, a warm-up script requests every public page to fill the cache. Because the page cache lives only in memory (`isrFlushToDisk: false`, Phase 2), every container start first calls a secured "revalidate everything" route handler (a secret from env, constant-time compare, POST only, rate-limited). Then the warm-up runs. Without that step, pages prerendered at build would serve build-time HTML after an unplanned restart. Phase 4 builds all of this for the staging droplet first; the OVH move is a later phase. Keep the code host-agnostic: env-based config, so the same image runs on both servers.

### Staging on DigitalOcean first (decided 2026-11-14)
Until the client buys the OVH VPS, the site runs on a DigitalOcean server. It's temporary: the client clicks through the site there and gives feedback while we finish the open items.
- **Launch:** when everything is done, the site moves to the OVH VPS described above and goes live there. Then the DigitalOcean server is shut down.
- **Same setup on both:** the same Docker image and compose file run on both servers; only env, secrets and DNS differ. So the move is a copy, and staging rehearses the OVH deploy.
- **Hidden from search engines:** staging keeps `noindex` on, so robots.txt blocks everything and the sitemap stays empty.
- **Server:** the user's existing droplet (1 vCPU, 1 GB RAM, 25 GB disk). It already runs another staging site and a small game server, each under its own Linux user. Our stack gets its own user too.
  - Memory is the tight part: the containers get memory limits, Postgres is tuned small, and the droplet needs swap. Building on the droplet is out of the question; CI builds the image.
- **Address:** an sslip.io hostname built from the droplet's IP (no domain), with HTTPS.
- **Access:** the whole site sits behind one shared login (basic auth). The admin also keeps its own Payload login.
- **Data:** the client's edits on staging are final and move to OVH. So staging is the source of truth: it needs backups, and the seed runs there only once, for the first load. The move is a final dump plus `uploads/`.
- **Deploys:** GitHub Actions on every push to `master`.
- **Email:** none on staging. The forms stay UI only until the client decides about the contact form. "Forgot password" doesn't work, so we set admin passwords directly.
- **Who does what:** the user runs the droplet and GitHub steps; the code and the runbook come from Phase 4.

From the Phase 1 review, before launch:
- Add a Payload email adapter. Without one, "forgot password" has nowhere to send the link. The same adapter sends the Anmeldeformular and Kontakt submissions, which are UI only until then (decided 2026-11-12).
- `GET /api/media` lists every media doc, including images used only in drafts. The file route needs public read; filter only the list endpoint if that matters.
