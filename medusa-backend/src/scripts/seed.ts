import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Drop #1 seed: 訳あり日本クラフト食品 $95固定セット (煎茶 + 味噌 + 干し椎茸).
 * Usage: npx medusa exec ./src/scripts/seed.ts
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModule = container.resolve(Modules.PRODUCT);

  logger.info("Seeding Drop #1 product...");

  const [existing] = await (productModule as any).listProducts({
    handle: "drop-001-tea-miso-shiitake",
  });
  if (existing) {
    logger.info("Drop #1 already seeded, skipping");
    return;
  }

  await (productModule as any).createProducts({
    title: "Sericia Drop #1 — Sencha × Miso × Dried Shiitake",
    handle: "drop-001-tea-miso-shiitake",
    description:
      "Rescued from Japanese producers before disposal. Near-expiry craft sencha, barrel-aged miso, and hand-dried shiitake — same quality, half the waste.",
    status: "published",
    options: [{ title: "Bundle", values: ["Standard"] }],
    variants: [
      {
        title: "Standard Bundle",
        sku: "DROP-001-STD",
        manage_inventory: true,
        prices: [{ amount: 9500, currency_code: "usd" }],
        options: { Bundle: "Standard" },
        metadata: {
          weight_g: 480,
          ems_bracket: "500g",
          shipping_jpy: 2150,
          shelf_life_days: 90,
        },
      },
    ],
  });

  logger.info("Drop #1 seeded.");
}
