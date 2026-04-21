import type { Block } from "payload";

export const StoryBlock: Block = {
  slug: "story",
  labels: { singular: "Story", plural: "Story blocks" },
  imageAltText: "Rich text + image editorial block",
  fields: [
    {
      name: "eyebrow",
      type: "text",
      localized: true,
      admin: { description: "Small kicker above the heading." },
    },
    {
      name: "heading",
      type: "text",
      localized: true,
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      required: true,
    },
    {
      name: "imageRight",
      type: "upload",
      relationTo: "media",
      admin: { description: "Image shown to the right of the text on desktop." },
    },
    {
      name: "imageLayout",
      type: "select",
      defaultValue: "right",
      options: [
        { label: "Image right", value: "right" },
        { label: "Image left", value: "left" },
        { label: "Image below", value: "below" },
      ],
    },
  ],
};

export default StoryBlock;
