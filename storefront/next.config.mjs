import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    NEXT_PUBLIC_CROSSMINT_CLIENT_ID: process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID,
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // Payload writes to the pg schema only at runtime. At build-time Payload
  // still tries to resolve some server-only modules — these aliases keep
  // them from being bundled for the edge runtime.
  serverExternalPackages: [
    "sharp",
    "@payloadcms/db-postgres",
    "pg",
  ],
};

export default withPayload(withNextIntl(nextConfig), {
  devBundleServerPackages: false,
});
