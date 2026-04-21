import type { Block } from "payload";

export const TestimonialsBlock: Block = {
  slug: "testimonialsStrip",
  labels: { singular: "Testimonials", plural: "Testimonial blocks" },
  imageAltText: "Carousel or grid of customer testimonials",
  fields: [
    {
      name: "heading",
      type: "text",
      localized: true,
    },
    {
      name: "items",
      type: "relationship",
      relationTo: "testimonials",
      hasMany: true,
      admin: {
        description:
          "Pick testimonials to feature here. Leave empty to auto-pull latest verified.",
      },
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 6,
      admin: {
        description: "Max testimonials to show when auto-pulling.",
      },
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "carousel",
      options: [
        { label: "Carousel", value: "carousel" },
        { label: "Grid", value: "grid" },
      ],
    },
  ],
};

export default TestimonialsBlock;
