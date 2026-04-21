import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    group: "Content",
    description:
      "Uploads (images, video, PDF). Cloud storage plugin rewrites to Supabase S3-compat bucket.",
  },
  access: {
    read: () => true, // public read (needed for storefront rendering)
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) =>
      !!user && (user.role === "admin" || user.role === "editor"),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  upload: {
    mimeTypes: [
      "image/*",
      "video/*",
      "application/pdf",
      "image/svg+xml",
    ],
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined, position: "centre" },
      { name: "card", width: 800, height: undefined, position: "centre" },
      { name: "hero", width: 1600, height: undefined, position: "centre" },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      admin: { description: "Alt text for accessibility and SEO. Required." },
    },
    {
      name: "caption",
      type: "text",
      localized: true,
    },
    {
      name: "credit",
      type: "text",
      admin: { description: "Photographer / source credit (optional)." },
    },
  ],
};

export default Media;
