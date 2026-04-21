import type { CollectionConfig, Where } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "author"],
    group: "Content",
    description:
      "Long-form journal articles and story pieces. Localized across 9 languages.",
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      // Public: only published with date in the past
      const where: Where = {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      };
      return where;
    },
    create: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 20,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL slug, lowercase, hyphen-separated. Not localized.",
      },
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Story", value: "story" },
        { label: "Guide", value: "guide" },
        { label: "Product", value: "product" },
        { label: "Press", value: "press" },
        { label: "Journal", value: "journal" },
      ],
      defaultValue: "journal",
    },
    {
      name: "tldr",
      type: "richText",
      localized: true,
      admin: { description: "1-3 sentence summary shown at top of article." },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      required: true,
    },
    {
      name: "highlights",
      type: "array",
      localized: true,
      labels: { singular: "Highlight", plural: "Highlights" },
      fields: [
        { name: "text", type: "text", required: true },
      ],
      admin: { description: "Key takeaways shown as a bulleted list." },
    },
    {
      name: "pullQuotes",
      type: "array",
      localized: true,
      labels: { singular: "Pull quote", plural: "Pull quotes" },
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "attribution", type: "text" },
      ],
    },
    {
      name: "faq",
      type: "array",
      localized: true,
      labels: { singular: "FAQ item", plural: "FAQ items" },
      fields: [
        { name: "q", type: "text", required: true, label: "Question" },
        { name: "a", type: "textarea", required: true, label: "Answer" },
      ],
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

export default Articles;
