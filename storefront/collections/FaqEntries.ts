import type { CollectionConfig } from "payload";

/**
 * F57 — FaqEntries collection.
 *
 * Powers the standalone /faq page. Each entry is a single Q+A pair tagged
 * with a `section` to group them on the rendered page (Drops / Shipping /
 * Payment / Food / Returns / Company by default).
 *
 * Editor flow:
 *   1. /cms/admin/collections/faqEntries → New
 *   2. Pick section, write question + answer, set displayOrder
 *   3. Save → /faq picks it up on next request (no deploy)
 *
 * Why a collection (not an array on a Pages global):
 *   - Each entry can be drafted, autosaved, versioned independently.
 *   - Editors can search / filter / bulk-edit by section across the whole
 *     FAQ corpus.
 *   - Localised across 10 locales without nesting array localization
 *     (Payload localizes scalar fields cleanly; nested arrays inside
 *     globals get awkward UX).
 *   - JSON-LD FAQPage schema can read directly from the collection
 *     query result without traversing nested arrays.
 *
 * Two fields for the answer:
 *   - `answer` (richText, Lexical) — the rendered HTML on /faq with inline
 *     links / emphasis / lists.
 *   - `plainAnswer` (textarea) — the same content stripped of formatting,
 *     fed into FAQPage JSON-LD schema.org (Google rich results require
 *     plain strings). Maintaining both is the price of GEO-grade markup;
 *     a Payload `beforeChange` hook can auto-derive plainAnswer from
 *     Lexical in F58.
 */
export const FaqEntries: CollectionConfig = {
  slug: "faqEntries",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "section", "displayOrder", "active"],
    group: "Content",
    description:
      "Q+A entries on the public /faq page. Grouped by section, sorted by displayOrder within each section. Localised across all 10 supported locales.",
  },
  access: {
    read: () => true, // public read — /faq is unauthenticated
    create: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 10,
  },
  fields: [
    {
      name: "section",
      type: "select",
      required: true,
      defaultValue: "drops",
      options: [
        { label: "Drops", value: "drops" },
        { label: "Shipping", value: "shipping" },
        { label: "Payment", value: "payment" },
        { label: "Food", value: "food" },
        { label: "Returns", value: "returns" },
        { label: "Company", value: "company" },
      ],
      admin: {
        description:
          "Section bucket. Order on the rendered page is fixed by SECTION_ORDER in lib/faq.ts (drops → shipping → payment → food → returns → company).",
      },
    },
    {
      name: "sectionLabel",
      type: "text",
      localized: true,
      admin: {
        description:
          "Optional display label for the section eyebrow (e.g. \"Shipping\" → \"配送\" in ja). Defaults to the capitalised section value.",
      },
    },
    {
      name: "question",
      type: "text",
      required: true,
      localized: true,
      admin: {
        description: "Question as it appears on the page. Phrase as the customer would.",
      },
    },
    {
      name: "answer",
      type: "richText",
      required: true,
      localized: true,
      admin: {
        description:
          "Rich answer (supports inline links, lists, emphasis). Use this to link out to authoritative sources (/shipping, /refund, /tokushoho) instead of duplicating policy.",
      },
    },
    {
      name: "plainAnswer",
      type: "textarea",
      required: true,
      localized: true,
      admin: {
        description:
          "Plain-text version for FAQPage JSON-LD schema (Google rich results / AI search engine citation). Strip all formatting — no markdown, no links.",
      },
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        description:
          "Sort key within the section (ascending). Use 10/20/30 spacing so you can insert without renumbering.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Untick to hide the entry without deleting it (e.g. while updating).",
      },
    },
  ],
};
