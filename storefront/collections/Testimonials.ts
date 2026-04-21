import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "author",
    defaultColumns: ["author", "country", "rating", "verified"],
    group: "Content",
    description:
      "Customer testimonials shown on homepage and product pages.",
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
      name: "author",
      type: "text",
      required: true,
      admin: { description: "Customer display name (e.g. 'Emma R.')." },
    },
    {
      name: "country",
      type: "text",
      admin: { description: "Country label (e.g. 'United States', '日本')." },
    },
    {
      name: "product",
      type: "group",
      fields: [
        {
          name: "linkedArticle",
          type: "relationship",
          relationTo: "articles",
          admin: {
            description:
              "Optional relationship to a story/product article. Leave blank if using free text.",
          },
        },
        {
          name: "freeText",
          type: "text",
          admin: {
            description:
              "Free-text product label if not linked to an article (e.g. 'Uji Sencha 50g').",
          },
        },
      ],
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
      localized: true,
    },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Verified purchaser badge." },
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "orderDate",
      type: "date",
      admin: {
        description: "Date of purchase (for recency sorting).",
        date: { pickerAppearance: "dayOnly" },
      },
    },
  ],
};

export default Testimonials;
