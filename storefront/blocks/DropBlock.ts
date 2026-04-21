import type { Block } from "payload";

export const DropBlock: Block = {
  slug: "drop",
  labels: { singular: "Drop", plural: "Drop blocks" },
  imageAltText: "Limited-edition product drop with countdown",
  fields: [
    {
      name: "dropNumber",
      type: "text",
      required: true,
      admin: { description: "E.g. 'DROP 07' or '2026-春'." },
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
      localized: true,
    },
    {
      name: "productHandle",
      type: "text",
      required: true,
      admin: {
        description:
          "Medusa product handle (e.g. 'sencha-uji-50g') — links to storefront /products/<handle>.",
      },
    },
    {
      name: "countdownTo",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
    },
  ],
};

export default DropBlock;
