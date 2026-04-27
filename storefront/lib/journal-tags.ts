/**
 * Client-safe journal tag types + label helper.
 *
 * Why this exists separately from `journal-entries.ts`:
 *
 *   The journal index fuses three data sources, one of which (Payload) pulls
 *   in `pg` / `pg-connection-string` and Node-only built-ins (`fs`, `dns`,
 *   `net`) at module-evaluation time. Webpack will happily try to bundle
 *   that for a client component if any "use client" file imports — even
 *   transitively — from `journal-entries.ts`.
 *
 *   This module is the boundary. It contains nothing but the JournalTag
 *   union and a tiny pure-function `tagLabel`. The client filter chip
 *   component imports from here; the server-side aggregator re-exports
 *   from here so consumers see one canonical source.
 */

export type JournalTag = "story" | "guide" | "country-guide" | "technique";

const TAG_LABEL: Record<JournalTag, string> = {
  story: "Story",
  technique: "Technique",
  guide: "Guide",
  "country-guide": "Country guide",
};

export function tagLabel(t: JournalTag): string {
  return TAG_LABEL[t];
}
