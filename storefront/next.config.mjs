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
  // F40 hotfix: F39 attempted experimental.optimizePackageImports for
  // framer-motion + 3 others to shave bundle weight. Three deploys in
  // a row hit Hetzner CPX22 build-time OOM (4GB heap on 3.7GB RAM box,
  // swap thrashing for 10+ min, eventually exit 255 with no clean
  // error message). The bundle-size win wasn't worth the deploy
  // instability. Re-evaluate after migrating off Hetzner CPX22 to a
  // box with ≥8GB RAM.
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
