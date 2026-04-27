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
| 10 | [Site Settings — hero copy & announcement bar (NEW Phase 1)](#cms-site-settings) |
| 11 | [Hero block — mid-page editorial hero (NEW)](#cms-hero-block) |

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
