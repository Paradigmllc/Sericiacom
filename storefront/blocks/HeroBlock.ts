import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero blocks" },
  imageAltText: "Full-bleed hero with video/image background and CTA",
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "subheading",
      type: "textarea",
      localized: true,
    },
    {
      name: "ctaLabel",
      type: "text",
      localized: true,
      admin: { description: "Button label (e.g. 'Shop now')." },
    },
    {
      name: "ctaUrl",
      type: "text",
      admin: { description: "Destination URL or internal path." },
    },
    {
      name: "videoMedia",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Background video or fallback image. Prefer MP4/WebM <10MB.",
      },
    },
    {
      name: "fallbackImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Static image shown on mobile or if video fails." },
    },
    {
      name: "align",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
  ],
};

export default HeroBlock;
