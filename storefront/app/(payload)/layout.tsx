/* eslint-disable */
/**
 * Payload CMS admin layout.
 *
 * This layout intentionally does NOT wrap with the storefront's next-intl
 * provider, LuxuryLoader, Sonner Toaster, or DifyChat. Payload ships its
 * own <html><body> wrapper via RootLayout.
 *
 * The route group `(payload)` isolates these routes from the storefront's
 * `app/layout.tsx`.
 */
import type { Metadata } from "next";

import config from "@payload-config";
import "@payloadcms/next/css";
import {
  handleServerFunctions,
  RootLayout,
} from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import React from "react";

import { importMap } from "./cms/admin/importMap";
import "./custom.scss";

type Args = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Sericia CMS",
  description: "Content management for sericia.com",
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
