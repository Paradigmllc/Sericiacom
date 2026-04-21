import type { GlobalConfig } from "payload";
import { HeroBlock } from "../blocks/HeroBlock";
import { DropBlock } from "../blocks/DropBlock";
import { TestimonialsBlock } from "../blocks/TestimonialsBlock";
import { PressStripBlock } from "../blocks/PressStripBlock";
import { StoryBlock } from "../blocks/StoryBlock";
import { NewsletterBlock } from "../blocks/NewsletterBlock";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: {
    group: "Settings",
    description:
      "Homepage block composition. Drag-and-drop blocks in any order.",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    max: 50,
  },
  fields: [
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "blocks",
      type: "blocks",
      label: "Homepage blocks",
      minRows: 0,
      blocks: [
        HeroBlock,
        DropBlock,
        TestimonialsBlock,
        PressStripBlock,
        StoryBlock,
        NewsletterBlock,
      ],
    },
  ],
};

export default Homepage;
