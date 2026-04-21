import type { Block } from "payload";

export const NewsletterBlock: Block = {
  slug: "newsletter",
  labels: { singular: "Newsletter", plural: "Newsletter blocks" },
  imageAltText: "Email newsletter capture form",
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
      required: true,
      localized: true,
      defaultValue: "Subscribe",
    },
    {
      name: "disclaimer",
      type: "textarea",
      localized: true,
      admin: { description: "Small text below form (e.g. GDPR consent line)." },
    },
    {
      name: "incentive",
      type: "text",
      localized: true,
      admin: {
        description:
          "Optional incentive text (e.g. '15% off first order' / 'Free shipping guide').",
      },
    },
  ],
};

export default NewsletterBlock;
