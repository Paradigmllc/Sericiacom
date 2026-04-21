import type { CollectionConfig } from "payload";

export const PressMentions: CollectionConfig = {
  slug: "pressMentions",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "date", "url"],
    group: "Content",
    description:
      "Press / media mentions. Logos shown in homepage press strip.",
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
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Publication name (e.g. 'Monocle', 'Kinfolk')." },
    },
    {
      name: "logoSvg",
      type: "upload",
      relationTo: "media",
      admin: { description: "Monochrome SVG logo preferred." },
    },
    {
      name: "url",
      type: "text",
      admin: { description: "Link to the article or feature." },
    },
    {
      name: "quote",
      type: "textarea",
      localized: true,
      admin: { description: "Pull quote from the article (optional)." },
    },
    {
      name: "date",
      type: "date",
      admin: { date: { pickerAppearance: "monthOnly" } },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { description: "Display order in press strip." },
    },
  ],
};

export default PressMentions;
