import type { CollectionConfig } from "payload";

export const Tools: CollectionConfig = {
  slug: "tools",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order"],
    group: "Content",
    description:
      "Metadata for utility tools (shelf-life calculator, miso finder, etc.). Powers /tools/[slug] pages.",
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
  versions: { drafts: true },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL slug (e.g. 'shelf-life', 'miso-finder')." },
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      localized: true,
      admin: { description: "Short description shown in tool grid." },
    },
    {
      name: "icon",
      type: "text",
      admin: {
        description:
          "Lucide icon name (e.g. 'Clock', 'Soup') OR emoji, depending on storefront rendering choice.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { description: "Sort order in tool grid (lower = first)." },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      admin: {
        description:
          "Optional long-form explanation shown below the tool widget.",
      },
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

export default Tools;
