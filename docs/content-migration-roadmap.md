#### 📋 目次

| # | セクション |
|---|----------|
| 1 | [Why this exists](#cm-why) |
| 2 | [Architectural pattern (Payload-first / hardcoded-fallback)](#cm-pattern) |
| 3 | [Surface audit (2026-04-30)](#cm-audit) |
| 4 | [Migration sequence + status](#cm-sequence) |
| 5 | [Per-surface migration template](#cm-template) |
| 6 | [Quality gates per migration](#cm-gates) |

---

# Sericia Content Migration Roadmap

> Companion to the project content rule "全コンテンツはハードコードNG、
> DB化、PayloadCMSで編集可能に" (2026-04-30 directive). Each surface
> below moves from hardcoded JSX/strings to Payload-driven editing.

<a id="cm-why"></a>
## 1. Why this exists

Hardcoded UI strings have three failure modes for a luxury D2C operating
across 10 locales with non-engineer editors:

1. **Editor friction** — every copy change is a code review + deploy.
   Average wall-clock from "want to update this" to "live" is hours.
2. **Translation drift** — 10 locale parity is hard when the source of
   truth is JSX scattered across files. Payload's `localized: true` per
   field guarantees parity by construction.
3. **A/B testing blocked** — no way to swap copy without engineering.

The directive's goal: editors edit at `/cms/admin` and see results live
within seconds. Engineers only touch the rendering layer.

<a id="cm-pattern"></a>
## 2. Architectural pattern (Payload-first / hardcoded-fallback)

Every migrated surface follows the same three-file shape established by
F55 (PaymentSettings) + F57 (FaqEntries):

```
storefront/
├── globals/<Name>.ts            ← Payload schema (or collections/<Name>.ts)
├── lib/<name>.ts                ← server fetcher + cached() memo + fallback
└── scripts/seed-<name>.ts       ← idempotent bootstrap (run from
                                  docker-entrypoint Phase 2)
```

The fetcher in `lib/<name>.ts` always:
1. Tries Payload first (catches all errors silently).
2. Returns a non-null structured response — even on failure.
3. Falls back to constants embedded in the same file or a sibling
   `*-fallback.ts` so build-time and cold-start render correctly.

The fallback is **NOT the source of truth** after the seed runs — but
it stays in code as a safety net for Payload outages, build-time, and
fresh DB cold-starts.

<a id="cm-audit"></a>
## 3. Surface audit (2026-04-30 hardcoded-content audit)

Run command:
```bash
for p in faq about accessibility tokushoho shipping privacy terms refund; do
  f=$(find storefront/app -name "page.tsx" -path "*$p*" | head -1)
  lines=$(wc -l < "$f")
  hint=$(grep -cE '"[A-Z][a-z]+ [a-z]+|<h[1-6][^>]*>[^<]+<|<p[^>]*>[A-Z]' "$f")
  echo "$p: $lines lines / $hint hardcoded text hints"
done
```

| Surface | Lines | Hint Count | Edit Frequency | Migration Priority | Status |
|---------|-------|-----------:|----------------|--------------------|--------|
| `/faq` | 443 | 28 | High (weekly) | P0 — F57 | ✅ Migrated |
| `/about` | 244 | 40 | Med (monthly) | P1 | ⏸ Pending |
| `/shipping` | 160 | 18 | Med (rate updates) | P1 | ⏸ Pending |
| `/refund` | 105 | 7 | Low (quarterly) | P2 | ⏸ Pending |
| `/tokushoho` | 317 | 9 | Low (legal-bound) | P2 | ⏸ Pending |
| `/terms` | 137 | 21 | Low (legal review) | P3 | ⏸ Pending |
| `/privacy` | 93 | 11 | Low (legal review) | P3 | ⏸ Pending |
| `/accessibility` | 212 | 7 | Low | P3 | ⏸ Pending |
| `/tools/*` (8 pages) | varies | varies | Med | P2 | ⏸ Pending |

Already migrated (pre-2026-04-30):
- `/` (homepage) — `SiteSettings` + `Homepage` globals (M2 / M4c-10)
- `/journal/*` — `Articles` collection
- `/guides/*` — `Guides` collection
- `/products/*` — Medusa catalogue
- `/pay/[orderId]` — F55 `PaymentSettings` global

<a id="cm-sequence"></a>
## 4. Migration sequence + status

### F55 — PaymentSettings (DONE 2026-04-30)

PaymentSettings global with country method matrix, checkout copy, receipt
copy, alternative-provider toggle. Editor at
`/cms/admin/globals/paymentSettings`. Fallback in `lib/payment-routing.ts`.

### F57 — FaqEntries collection (DONE 2026-04-30)

Per-Q+A docs grouped by section. Editor adds questions at
`/cms/admin/collections/faqEntries`. Fallback in `lib/faq.ts`.

### F58 — About page → SiteSettings.aboutPage group (NEXT)

Single-doc surface. Use a group on the existing `SiteSettings` global
since /about is a singleton (not a list). Fields:
- `eyebrow` (text, localized)
- `headline` (text, localized)
- `intro` (textarea, localized)
- `body` (richText, localized)
- `pillars` (array of {title, body}, localized)
- `producerCount` (number) — for the hero stat

### F59 — Shipping rates → ShippingRates global

Per-region row (region code, range_g min/max, ems_jpy). Editor edits
when EMS prices update.

### F60 — RefundPolicy + Tokushoho (legal pages)

Two globals or one Pages collection. Tokushoho is special-law-bound
(特定商取引法) — editor changes need legal review per item.

### F61 — Terms + Privacy + Accessibility

Same legal-review constraint as F60. Could batch into one Pages collection.

### F62 — Tools (8 pages)

Each tool has prose + interactive widget. Prose moves to Tools collection
(already exists — needs editor onboarding). Widgets stay code-only.

<a id="cm-template"></a>
## 5. Per-surface migration template

For each surface follow this 7-step recipe:

1. **Schema** — Add `globals/<Name>.ts` or `collections/<Name>.ts` with
   localized text fields and richText for prose.
2. **Register** — Import into `payload.config.ts` and add to `globals: []`
   or `collections: []`.
3. **Lib fetcher** — Create `lib/<name>.ts` mirroring `payment-settings.ts`
   pattern: `cache()` memo, try/catch around `payload.findGlobal/find`,
   fallback to embedded constants.
4. **Seed script** — Create `scripts/seed-<name>.ts` that imports the
   constants and writes them via `payload.create/updateGlobal`. Make it
   idempotent (skip if already populated; `--reset` to overwrite).
5. **Auto-seed** — Add `npm run seed:<name>` script to `package.json` and
   call from `docker-entrypoint.sh` Phase 2 (fail-open).
6. **Page rewrite** — Refactor `app/.../page.tsx` to call the lib fetcher
   instead of consuming hardcoded constants. Preserve JSON-LD by reading
   from the resolved data.
7. **Verify + commit** — TS check, smoke test on `/cms/admin`, commit.

<a id="cm-gates"></a>
## 6. Quality gates per migration

Each migration must satisfy:

- ✅ **Fallback safety**: lib fetcher returns non-null structured data even
  when Payload throws. The page must render with the fallback even if the
  Payload DB is offline.
- ✅ **Localised**: every editor-visible text field has `localized: true`.
  ja/de/fr/es/it/ko/zh-TW/ru/ar locales fall back to en when unset.
- ✅ **JSON-LD parity**: any structured-data markup (FAQPage, Article,
  BreadcrumbList) reads from the resolved data, not constants.
- ✅ **Idempotent seed**: re-running the seed script is a no-op (existing
  entries skipped). `--reset` flag wipes + re-seeds.
- ✅ **Type-safe**: TS strict pre-check (`tsc --noEmit`) passes locally
  and on Coolify build.
- ✅ **Operator runbook**: `docs/launch-operator-checklist.md` updated
  with any new env vars or post-deploy steps.
