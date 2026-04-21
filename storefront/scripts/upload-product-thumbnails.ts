/**
 * Product thumbnail uploader — idempotent, config-driven.
 *
 * Reads scripts/product-thumbnails.json and applies the {handle → thumbnail}
 * mapping to the Medusa backend via the admin API. Safe to re-run: already-
 * matching thumbnails are skipped with no write.
 *
 * Used during launch (Drop #1) to swap the four seeded products from
 * thumbnail=null to Unsplash placeholders so the storefront renders real
 * cards instead of grey boxes. When real brand photography arrives, just
 * edit product-thumbnails.json and re-run.
 *
 * Why admin API (not Store API): Store API is read-only. Updating
 * `thumbnail` needs the admin JWT flow below.
 *
 * Required env (set in shell before running — DO NOT commit):
 *   MEDUSA_BACKEND_URL     default: https://api.sericia.com
 *   MEDUSA_ADMIN_EMAIL
 *   MEDUSA_ADMIN_PASSWORD
 *
 * Usage:
 *   MEDUSA_ADMIN_EMAIL=... MEDUSA_ADMIN_PASSWORD=... \
 *     npm run products:upload-thumbnails
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

type ThumbnailMapping = {
  thumbnail: string;
  attribution?: string;
};
type Config = {
  mappings: Record<string, ThumbnailMapping>;
};

type AdminProduct = {
  id: string;
  handle: string;
  title: string;
  thumbnail: string | null;
  metadata: Record<string, unknown> | null;
};

const BACKEND = process.env.MEDUSA_BACKEND_URL || "https://api.sericia.com";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

function fail(msg: string): never {
  console.error(`[upload-thumbnails] ${msg}`);
  process.exit(1);
}

async function getAdminToken(): Promise<string> {
  if (!EMAIL || !PASSWORD) {
    fail(
      "MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD must be set. Refusing to run.",
    );
  }
  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    fail(`admin auth failed: HTTP ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { token?: string };
  if (!body.token) fail(`admin auth returned no token: ${JSON.stringify(body)}`);
  return body.token;
}

async function listProducts(token: string): Promise<AdminProduct[]> {
  const res = await fetch(
    `${BACKEND}/admin/products?fields=id,handle,title,thumbnail,metadata&limit=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) {
    fail(`list products failed: HTTP ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { products: AdminProduct[] };
  return body.products;
}

async function updateProductThumbnail(
  token: string,
  product: AdminProduct,
  mapping: ThumbnailMapping,
): Promise<void> {
  const nextMetadata = {
    ...(product.metadata ?? {}),
    ...(mapping.attribution
      ? { image_attribution: mapping.attribution }
      : {}),
  };
  const res = await fetch(`${BACKEND}/admin/products/${product.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      thumbnail: mapping.thumbnail,
      metadata: nextMetadata,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(
      `update ${product.handle} failed: HTTP ${res.status} ${await res.text()}`,
    );
  }
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const cfgPath = resolve(here, "product-thumbnails.json");
  const cfg = JSON.parse(readFileSync(cfgPath, "utf-8")) as Config;

  console.log(`[upload-thumbnails] backend=${BACKEND}`);
  console.log(
    `[upload-thumbnails] configured mappings: ${Object.keys(cfg.mappings).length}`,
  );

  const token = await getAdminToken();
  console.log("[upload-thumbnails] admin auth ok");

  const products = await listProducts(token);
  console.log(`[upload-thumbnails] fetched ${products.length} products`);

  let applied = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [handle, mapping] of Object.entries(cfg.mappings)) {
    const p = products.find((x) => x.handle === handle);
    if (!p) {
      console.warn(`[upload-thumbnails] skip: handle "${handle}" not found`);
      notFound++;
      continue;
    }
    if (p.thumbnail === mapping.thumbnail) {
      console.log(`[upload-thumbnails] skip: ${handle} already up to date`);
      skipped++;
      continue;
    }
    try {
      await updateProductThumbnail(token, p, mapping);
      console.log(`[upload-thumbnails] ok: ${handle}`);
      applied++;
    } catch (err) {
      console.error(`[upload-thumbnails] FAIL: ${handle}`, err);
    }
  }

  console.log(
    `[upload-thumbnails] done — applied=${applied} skipped=${skipped} not_found=${notFound}`,
  );
  if (notFound > 0) process.exit(2);
}

main().catch((err) => {
  console.error("[upload-thumbnails] unhandled error:", err);
  process.exit(1);
});
