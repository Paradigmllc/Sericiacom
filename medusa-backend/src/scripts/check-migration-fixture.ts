import assert from "node:assert/strict";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkMigrationFixture({ container }: ExecArgs) {
  if (process.env.SERICIA_MIGRATION_CI !== "true") throw new Error("CI fixture check only");
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "status", "variants.id", "variants.manage_inventory", "variants.allow_backorder", "variants.prices.amount", "variants.prices.currency_code"],
    filters: { handle: "migration-ci-tea" },
  });
  assert.equal(data.length, 1, "Repeated migration must not duplicate products");
  assert.equal(data[0].status, "draft");
  assert.equal(data[0].variants?.length, 1);
  const variant = data[0].variants![0]!;
  assert.equal(variant.manage_inventory, true);
  assert.equal(variant.allow_backorder, false);
  assert.ok("prices" in variant && Array.isArray(variant.prices));
  const price: unknown = variant.prices[0];
  assert.ok(price && typeof price === "object" && "currency_code" in price && "amount" in price);
  assert.equal(price.currency_code, "jpy");
  assert.equal(Number(price.amount), 1200);
}
