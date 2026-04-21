import type { Block } from "payload";

export const PressStripBlock: Block = {
  slug: "pressStrip",
  labels: { singular: "Press strip", plural: "Press strip blocks" },
  imageAltText: "Row of press/media logos",
  fields: [
    {
      name: "heading",
      type: "text",
      localized: true,
      admin: { description: "Optional heading (e.g. 'As seen in')." },
    },
    {
      name: "items",
      type: "relationship",
      relationTo: "pressMentions",
      hasMany: true,
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 8,
    },
  ],
};

export default PressStripBlock;
