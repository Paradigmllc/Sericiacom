import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { planCatalogMigration } from "../../config/catalog-migration";

export default async function importShopifyCatalog({ container }: ExecArgs) {
  const file = process.env.SERICIA_CATALOG_SNAPSHOT;
  if (!file) throw new Error("SERICIA_CATALOG_SNAPSHOT is required");
  const snapshot: unknown = JSON.parse(await readFile(file, "utf8"));
  const products = planCatalogMigration(snapshot);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: existing } = await query.graph({
    entity: "product", fields: ["id", "handle", "metadata"],
    filters: { handle: products.map((product) => product.handle) },
    pagination: { take: 100 },
  });
  const pending = products.filter((product) => {
    const match = existing.find((item) => item.handle === product.handle);
    if (!match) return true;
    const digest = createHash("sha256").update(JSON.stringify(product)).digest("hex");
    if (match.metadata?.shopify_product_id !== product.metadata.shopify_product_id || match.metadata?.migration_digest !== digest) {
      throw new Error(`Existing product conflicts with import: ${product.handle}`);
    }
    return false;
  });
  logger.info(`Catalog migration: ${pending.length} new drafts, ${products.length - pending.length} already imported`);
  if (process.env.SERICIA_CATALOG_APPLY !== "true" || !pending.length) return;
  const fulfillment = container.resolve(Modules.FULFILLMENT);
  const profiles = await fulfillment.listShippingProfiles({ type: "default" });
  const profile = profiles[0] ?? await fulfillment.createShippingProfiles({ name: "Default", type: "default" });
  const { result } = await createProductsWorkflow(container).run({ input: {
    products: pending.map((product) => ({ ...product, shipping_profile_id: profile.id,
      metadata: { ...product.metadata, migration_digest: createHash("sha256").update(JSON.stringify(product)).digest("hex") },
    })),
  } });
  logger.info(`Catalog migration completed: ${result.length} drafts; no stock levels or sales channels imported`);
}
