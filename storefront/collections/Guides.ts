import type { CollectionConfig } from "payload";

export const Guides: CollectionConfig = {
  slug: "guides",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "country", "shippingDays"],
    group: "Content",
    description:
      "Per-country shipping & customs guides. Matches storefront /guides/[country] pages.",
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return { _status: { equals: "published" } };
    },
    create: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  versions: { drafts: true, maxPerDoc: 10 },
  fields: [
    {
      name: "country",
      type: "select",
      required: true,
      unique: true,
      index: true,
      options: [
        { label: "United States", value: "us" },
        { label: "United Kingdom", value: "uk" },
        { label: "Germany", value: "de" },
        { label: "France", value: "fr" },
        { label: "Australia", value: "au" },
        { label: "Singapore", value: "sg" },
        { label: "Canada", value: "ca" },
        { label: "Hong Kong", value: "hk" },
        { label: "UAE / Middle East (Arabic)", value: "ar" },
      ],
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "shippingDays",
      type: "text",
      required: true,
      localized: true,
      admin: { description: "Example: '5-9 business days' or '3-5 日'" },
    },
    {
      name: "customsNotes",
      type: "textarea",
      localized: true,
      admin: { description: "Import duties, prohibited items, etc." },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      required: true,
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
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
      ],
    },
  ],
};

export default Guides;
