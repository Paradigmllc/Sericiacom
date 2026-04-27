# Sericia CMS Editing Guide

Hybrid CMS model: the **brand skeleton** (hero, ticker, footer, product listings) is coded in Next.js. The **editorial middle** — the space between "our philosophy" and the waitlist — is edited in Payload admin via drag-and-drop blocks.

This guide is for brand / content editors who need to update homepage copy without a deploy.

---

#### 📋 目次

| # | セクション |
|---|-----------|
| 1 | [Logging in](#cms-login) |
| 2 | [The homepage blocks panel](#cms-homepage-panel) |
| 3 | [Block type: Story](#cms-story) |
| 4 | [Block type: Newsletter](#cms-newsletter) |
| 5 | [Block types that currently don't render](#cms-noop) |
| 6 | [Localization — editing in 10 languages](#cms-i18n) |
| 7 | [Drafts vs publish](#cms-drafts) |
| 8 | [Media uploads](#cms-media) |
| 9 | [Troubleshooting](#cms-troubleshoot) |
| 10 | [Site Settings — hero copy & announcement bar (Phase 1)](#cms-site-settings) |
| 11 | [Hero block — mid-page editorial hero (Phase 1)](#cms-hero-block) |
| 12 | [Footer (Phase 2-A) — bands, columns, signature](#cms-footer) |
| 13 | [Coupon banner (Phase 2-C)](#cms-coupon) |
| 14 | [Homepage section copy (Phase 2-B) — 8 sections](#cms-homepage-copy) |
| 15 | [Header navigation (Phase 3-D)](#cms-nav) |
| 16 | [Region banners (Phase 3-E)](#cms-region) |

---

## <a id="cms-login"></a>1. Logging in

1. Navigate to **`https://sericia.com/cms/admin`**.
2. Sign in with your Payload editor account (provisioned by engineering — email `hello@sericia.com` for access).
3. The admin UI shows three groups on the left:
   - **Collections**: repeating content (Articles, Guides, Tools, Media, Testimonials, Press mentions).
   - **Globals**: singleton content (Site settings, **Homepage**).
   - **Users**: editor accounts.

Most homepage editing happens in **Globals → Homepage**.

---

## <a id="cms-homepage-panel"></a>2. The homepage blocks panel

Open **Globals → Homepage**. Scroll past the SEO fields (meta title / description / OG image) to the **Blocks** field.

- **Add block** button reveals 6 block types: Hero, Drop, Testimonials strip, Press strip, Story, Newsletter.
- Blocks can be reordered by dragging the handle on the left of each block card.
- Each block has a **Collapse** toggle — collapse older blocks so you can focus on what you're editing.
- Press **Save draft** to preview without publishing; **Publish changes** makes it live.

Only **Story** and **Newsletter** blocks render on the live homepage today. The other 4 block types are accepted by the schema (so editors can draft them) but currently no-op — see §5.

---

## <a id="cms-story"></a>3. Block type: Story

Purpose: an editorial section with a kicker, heading, rich text body, and an optional image. Use this for producer stories, seasonal notes, or "behind the drop" essays.

Fields:
- **Eyebrow** (optional): small all-caps kicker above the heading (e.g. `From the kitchen`).
- **Heading** (optional): one-line title (28–36px on the page).
- **Body** (required): rich text. Supports headings (H2/H3), lists, bold/italic, links, blockquotes, and inline images.
- **Image right** (optional): an image upload. Pulls from the **Media** collection — see §8.
- **Image layout**: `right` (default) / `left` / `below`.
  - `right` / `left`: image beside text on desktop (2 columns), stacks below text on mobile.
  - `below`: text is centered, image is full-width below — good for wide landscape photos.

**Localization**: eyebrow, heading, and body are all localized (§6). Images are shared across locales by default.

---

## <a id="cms-newsletter"></a>4. Block type: Newsletter

Purpose: an email capture section with editor-controlled heading and CTA label. Submissions flow into the same `/api/waitlist` endpoint as the coded waitlist section, but attribution is recorded as `source=homepage-newsletter-block` in Supabase.

Fields:
- **Heading** (required): main line (28–36px).
- **Subheading** (optional): 1–2 sentence supporting copy.
- **CTA label** (required): button text (e.g. `Join`, `Notify me`, `Get early access`). Default `Subscribe`.
- **Incentive** (optional): small all-caps kicker above the heading (e.g. `15% off first order` / `Free shipping guide`).
- **Disclaimer** (optional): small text below the form — good for GDPR / unsubscribe copy.

---

## <a id="cms-noop"></a>5. Block types that currently don't render

The schema accepts these block types so editors can draft future layouts, but they're **intentional no-ops** on the live homepage today — the data already renders elsewhere in the page:

| Block type | Where it already lives on the page |
|------------|----------------------------------|
| **Hero** | Coded `<CinematicHero />` (top of page, always present) |
| **Drop** | Coded "Current drop" / "Most loved" sections, driven by Medusa product data |
| **Testimonials strip** | `<TestimonialsWall />` — reads directly from the **Testimonials** collection below |
| **Press strip** | `<PressStrip />` — reads directly from the **Press mentions** collection at the top of the page |

If you add one of these block types to Homepage blocks, it won't show up on the live site. To add press mentions or testimonials, edit those **collections** directly, not homepage blocks.

---

## <a id="cms-i18n"></a>6. Localization — editing in 10 languages

Sericia serves 10 locales: `en`, `ja`, `ko`, `de`, `fr`, `es`, `it`, `zh-TW`, `ru`, `ar` (Arabic, RTL).

- The **locale switcher** is at the top-right of the admin UI.
- Switch locale → edit → save. Each locale is stored independently.
- Fields that are **not** localized (images, URLs, internal IDs) share a single value across all locales.
- If a field is empty in a given locale, Payload falls back to the default locale (`en`). So you can translate as you go — no need to fill every locale before publishing.

---

## <a id="cms-drafts"></a>7. Drafts vs publish

Homepage has **drafts** + **autosave** enabled:
- Autosave triggers every 2 seconds of inactivity.
- Drafts don't appear on the public homepage — only the `_status: published` version does.
- The last 50 versions are retained. Use **Versions** tab to roll back.

---

## <a id="cms-media"></a>8. Media uploads

All images, videos, and PDFs live in the **Media** collection. Uploads are stored in Supabase S3 and served via CDN.

Each Media entry has:
- **Alt text** (required): accessibility + SEO. 1 sentence describing what the image shows.
- **Caption** (optional): visible caption printed below the image in some contexts.
- **Credit** (optional): photographer / source credit.

When attaching media to a block, the picker lets you search existing uploads or upload a new file in place.

---

## <a id="cms-troubleshoot"></a>9. Troubleshooting

**"I published, but my block isn't showing on the live site."**
- Confirm the block is **Story** or **Newsletter** (§5 — other types don't render).
- Confirm you clicked **Publish changes**, not just **Save draft**.
- Payload's CDN cache for the homepage is ~60s — refresh after a minute.

**"My rich text body has Lexical errors."**
- Story body is required. Don't leave it empty — the block will fail to render.
- If pasting from Word / Google Docs, use the plain-text paste shortcut (`Cmd/Ctrl+Shift+V`) to strip hidden formatting that can break Lexical.

**"I don't see the locale switcher."**
- You need a user role that includes the locales you're editing. Ping engineering if you only see English.

---

## <a id="cms-site-settings"></a>10. Site Settings — hero copy & announcement bar (NEW Phase 1)

> Path in admin: **Globals → Site Settings**. Everything here is site-wide and immediately reflects on every page after Save.

### 10-1. Top hero section (the main "barren site fix")

The big hero that takes up most of the screen on the homepage is now **fully editor-controlled**.

**Background visuals (`heroVideoUrl` + `heroPosterUrl` + `heroImageUrl`)**:
1. First, upload your video to **Collections → Media** (an `.mp4` or `.webm`, ideally <10MB and 8–15 seconds).
2. Open the uploaded media; copy the **URL** field.
3. Paste it into Site Settings → `heroVideoUrl`.
4. (Optional but recommended) Upload a **poster** still image to Media, copy its URL into `heroPosterUrl`. The poster shows for ~50ms while the video buffers — eliminates the flash of empty hero.
5. (Optional) `heroImageUrl` is the fallback if you ever want to display a still instead of a video — leave empty to keep the gradient default.

**Copy (`heroCopy` group)** — every visible string is editable, with safe hardcoded brand fallbacks if you leave a field empty:

| Field | Default if empty | What you'd change it to |
|------|-----------------|----------------------|
| `eyebrow` | `Drop No. 01 — Limited release` | `Drop No. 02 — Spring matcha` |
| `headlineLine1` | `Rescued Japanese` | `Aged in Kyoto cellars` |
| `headlineLine2` | `craft food,` | `for thirty years.` |
| `body` | (Default 2-sentence sub-copy) | Your custom paragraph |
| `typewriterStrings` | 3 strings cycling | Add lines that cycle through the typewriter effect |
| `metaLines` | "Kyoto, Japan", "EMS worldwide", "50 units" | Drop-specific facts |
| `primaryCtaLabel` / `primaryCtaUrl` | `Shop the drop` → `/products` | `Reserve your bottle` → `/drops/02` |
| `secondaryCtaLabel` / `secondaryCtaUrl` | `Our story` → `/#story` | `Watch the film` → `/#film` |

**Localised**: every text field is independently editable per locale (en / ja / de / fr / es / it / ko / zh-TW / ru / ar). The locale switcher at the top of the admin form picks which language you're editing.

### 10-2. Announcement bar (top marquee)

The black scrolling bar at the very top of every page.

**Master switch (`announcementBar.enabled`)**: untick to hide the bar entirely.

**Items (`announcementBar.items[]`)** — preferred way to manage announcements:
- Click **Add item** to append a phrase.
- Each item has `text` (required, localised per locale) and an optional `link`.
- Drag the handle to reorder items.
- 4–8 items is the sweet spot. Too few → repetition obvious; too many → marquee speed drops.

**Legacy single text/link**: if `items[]` is empty, the admin form falls back to showing the single `text` + `link` fields (for backward compatibility with older content). Once you add anything to `items[]`, the legacy fields hide.

**Visual tuning**:
- `backgroundColor`: hex/rgb/oklch CSS color — defaults to Sericia ink (`#1a1a1a`).
- `textColor`: defaults to Sericia paper (`#ffffff`).
- `scrollSpeedSeconds`: full marquee cycle duration. Lower = faster. Default 40.

### 10-3. What still requires a code change?

Site Settings does NOT yet control:
- Footer 5-column links / signature copy (Phase 2)
- "Most loved" / "From the kitchen" section eyebrows on the homepage (Phase 2)
- CouponBanner / CookieConsent text (Phase 2 — Cookie text is intentionally locked for compliance audit)
- Tokushoho / Privacy / Terms / Refund pages (locked by design — legal text only changes via reviewed code commit)
- Navigation items (Phase 3)

These ship in subsequent phases. This guide will be updated as each phase lands.

---

## <a id="cms-hero-block"></a>11. Hero block — mid-page editorial hero (NEW)

The Homepage Globals → blocks panel now renders the **Hero** block type (it used to be a no-op).

**Use case**: drop a cinematic interlude mid-page. Example placements:
- Between TestimonialsWall and Newsletter.
- After the Drop section to act as a "Discover the new collection" break.
- Between two Story blocks to break editorial rhythm.

**Fields**:
- `heading` (required, localised) — large H2-style title.
- `subheading` (optional, localised) — sub-paragraph below.
- `videoMedia` — pick a video from Media collection. URL ending in `.mp4`/`.webm`/`.mov` plays as bg.
- `fallbackImage` — pick a still image. Used when `videoMedia` is missing or for static-only block.
- `ctaLabel` + `ctaUrl` — optional button.
- `align` — left / center / right text alignment.

**Visual treatment**: 70vh tall (top hero is 92vh) so it reads as an interlude. Same layered look — video → image fallback → grain → wash → text. Auto-mutes & loops video.

**Distinct from CinematicHero**: the top hero is rendered automatically on the homepage from Site Settings. The Hero **block** is for additional cinematic moments anywhere editor places them in `Globals → Homepage → blocks`.

**Performance note**: each Hero block adds ~5–10MB of assets if it has a video. Use sparingly — 1 mid-page hero per ~3 page lengths.

---

## <a id="cms-footer"></a>12. Footer (Phase 2-A) — bands, columns, signature

> Path: **Globals → Site Settings → Footer copy**.

The Aesop-tier footer has 5 bands, all editor-controlled:

| Band | What you edit | Field |
|------|--------------|------|
| 1 — Editorial top | Eyebrow / Heading / Body / Subscribe privacy note | `editorialEyebrow`, `editorialHeading`, `editorialBody`, `subscribePrivacyNote` |
| 2 — Link grid | N columns, each with title + N links | `columns[]` |
| 3 — Studio paragraph | The "Paradigm LLC — registered..." block | `studioCopy` |
| 4 — Legal micro-row | Copyright + tagline + locale label | `copyrightText`, `tagline`, `currentlyViewingLabel` |
| Social icons | Override the default Instagram + email | `socialLinks[]` |

### Editing columns

The `columns[]` field is a drag-drop array. The grid auto-fits, so 3, 4, or 5 columns all work without breaking layout.

Each column:
- `title` (required, localised) — the eyebrow heading.
- `links[]` — drag-drop array of:
  - `label` (required, localised)
  - `url` (required) — internal path `/foo` or external `https://...` or `mailto:` / `tel:`
  - `external` (checkbox) — tick to force `target="_blank"`. Auto-detected for `https://` URLs.

**If `columns[]` is empty**, the footer falls back to the coded 4-column structure (Shop / Tools / Company / Support) using next-intl translations.

---

## <a id="cms-coupon"></a>13. Coupon banner (Phase 2-C)

> Path: **Globals → Site Settings → Coupon banner**.

The launch promotion strip above the header.

| Field | Default | What you'd change it to |
|-------|--------|----------------------|
| `enabled` | `true` | Untick to hide entirely |
| `code` | `SERICIA10` | Must match a Medusa promotion exactly to apply at checkout |
| `headline` (localised) | `Launch offer` | `Spring drop`, `ローンチ特典` |
| `offerText` (localised) | `10% off your first order` | `15% off the next bundle` |
| `withCodePrefix` (localised) | `with code` | `at checkout`, `コード:` |
| `storageKeyVersion` | `v1` | **Bump to `v2`/`v3`/...** to force every visitor to see the bar again (new offer = new visibility) |

⚠️ **Don't change `code` without first creating the matching Medusa promotion**. The link goes to `/checkout?code=NEW_CODE`; Medusa rejects unknown codes silently → bad UX.

---

## <a id="cms-homepage-copy"></a>14. Homepage section copy (Phase 2-B) — 8 sections

> Path: **Globals → Site Settings → Homepage — section copy**.

Every section eyebrow / heading / lede on the homepage is editable. Each field is **localised across 10 languages** independently.

### Section reference

| Section name | Fields |
|------------|--------|
| `currentDrop` | eyebrow, title, lede |
| `featuredBundle` | eyebrow |
| `mostLoved` | eyebrow, title |
| `makers` | eyebrow, title, lede, **items[]** = `{ name, craft, region, note }` × N producers |
| `philosophy` | eyebrow, body |
| `waitlist` | eyebrow, title, body, footnote |
| `howItWorks` | eyebrow, title, **steps[]** = `{ number, title, body }` × 4 typical |
| `faq` | eyebrow, title, **items[]** = `{ q, a }` × N FAQs, ctaLabel, ctaUrl |

### How fallbacks work

Every field has a **hardcoded brand default** in code (e.g. `"Most loved"` / `"Return favourites from previous drops."`). When you leave a field empty, the default ships. This means:

- **Per-locale partial editing**: edit only `ja` for `mostLoved.title`, leave other locales empty → JA viewers see your custom copy, EN/DE/etc. see the brand default.
- **Per-section partial editing**: edit only `currentDrop`, leave `mostLoved` empty → only `currentDrop` changes; the rest stays brand-default.

### Replacing maker cards (per drop)

The 3 maker cards on the homepage default to `Yamane-en / Kurashige Jozoten / Yamagata Mori`. To swap for a new drop:

1. Open `homepageCopy.makers.items` (drag-drop array).
2. **Delete all existing items** (don't try to edit in place — easier to rebuild).
3. Add 3 new items, each with `name`, `craft` (localised), `region` (localised), `note` (localised).
4. Save.

**If `items[]` is empty**, the coded 3-maker fallback ships.

### Replacing How-it-works steps

`homepageCopy.howItWorks.steps[]` — each step has `number` (e.g. `"01"`), `title` (localised), `body` (localised).

### FAQ items

`homepageCopy.faq.items[]` — each Q&A is independently localised. Use sparingly — too many FAQ items diminish the "Aesop quiet" feel.

---

## <a id="cms-nav"></a>15. Header navigation (Phase 3-D)

> Path: **Globals → Site Settings → Navigation (header)**.

Replace the default 5-link nav (Shop / Current drop / Guides / Our story / Shipping) with whatever you want.

| Field | Notes |
|-------|------|
| `items[].label` | Localised. Required. |
| `items[].url` | Required. Internal `/foo` or external `https://...`. External auto-opens new tab with `rel="noopener"`. |
| `items[].highlighted` | Tick to render in stronger weight (CTA-style). Useful for "Drop coming soon" announcements. |

**If `items[]` is empty**, the coded 5-link default ships.

⚠️ The nav is desktop-only (`hidden md:flex`). Mobile users see the bag/account/search icons via HeaderClient — that's intentional and not editor-controlled.

---

## <a id="cms-region"></a>16. Region banners (Phase 3-E)

> Path: **Globals → Site Settings → Region banners** (top-level array).

Show different copy to different markets.

| Field | Notes |
|-------|------|
| `regionCode` | Pick from JP / US / EU / GB / CA / AU / SG / HK / ME |
| `text` | Localised. Required. e.g. `"Free shipping over $200"` for US / `"送料無料 ¥30,000〜"` for JP |
| `url` | Optional. If empty, banner is plain text. |
| `enabled` | Per-banner kill switch. |

**Resolution logic**: visitor's `country` cookie (set by P0-D country-redirect middleware) → maps to region slug → first matching enabled banner wins. Multiple entries for the same region are allowed but only the first renders.

**Distinct from CouponBanner**: regionBanner is for region facts (free shipping thresholds, compliance notes). CouponBanner is for promotions. Both can show simultaneously — they sit at different layers.

**Empty array** = no region banner shows.
