import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  label: "Site Settings",
  admin: {
    group: "Settings",
    description:
      "Global site-wide settings: announcement bar, social links, footer copy, hero defaults.",
  },
  access: {
    read: () => true, // public read; storefront fetches at build/runtime
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
  },
  fields: [
    {
      name: "heroVideoUrl",
      type: "text",
      admin: {
        description:
          "Fallback hero video URL (if homepage hero block has no videoMedia).",
      },
    },
    {
      name: "heroImageUrl",
      type: "text",
      admin: { description: "Fallback hero image URL." },
    },
    {
      name: "announcementBar",
      type: "group",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "text",
          type: "text",
          localized: true,
        },
        {
          name: "link",
          type: "text",
        },
        {
          name: "backgroundColor",
          type: "text",
          defaultValue: "#1a1a1a",
          admin: { description: "CSS color value (hex/rgb/oklch)." },
        },
        {
          name: "textColor",
          type: "text",
          defaultValue: "#ffffff",
        },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      labels: { singular: "Social link", plural: "Social links" },
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "X / Twitter", value: "x" },
            { label: "TikTok", value: "tiktok" },
            { label: "YouTube", value: "youtube" },
            { label: "Pinterest", value: "pinterest" },
            { label: "Facebook", value: "facebook" },
            { label: "LINE", value: "line" },
            { label: "WeChat", value: "wechat" },
            { label: "Threads", value: "threads" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "footerCopy",
      type: "group",
      fields: [
        {
          name: "tagline",
          type: "textarea",
          localized: true,
        },
        {
          name: "copyrightText",
          type: "text",
          localized: true,
        },
        {
          name: "legalLinks",
          type: "array",
          fields: [
            { name: "label", type: "text", localized: true, required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "supportEmail", type: "email" },
        { name: "pressEmail", type: "email" },
        { name: "phone", type: "text" },
        { name: "addressLines", type: "textarea", localized: true },
      ],
    },
    {
      name: "seoDefaults",
      type: "group",
      label: "SEO Defaults",
      fields: [
        { name: "defaultTitle", type: "text", localized: true },
        { name: "titleSuffix", type: "text", localized: true },
        { name: "defaultDescription", type: "textarea", localized: true },
        { name: "defaultOgImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

export default SiteSettings;
