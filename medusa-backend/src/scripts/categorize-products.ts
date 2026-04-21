import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Sericia — product categorization bootstrap
 *
 * Creates 4 top-level product categories and links seed products to them:
 *  - tea       → product-sencha
 *  - miso      → product-miso
 *  - mushroom  → product-shiitake
 *  - seasoning → drop-001-tea-miso-shiitake (temporary; review if a dedicated
 *                "drops" / "limited" category should be created)
 *
 * Why a separate script from seed.ts: category design is storefront-facing
 * taxonomy that may evolve (sub-categories, gifts, limited drops) independently
 * of the product catalogue. Keeping it standalone lets us re-run categorization
 * without touching stock levels / shipping options / regions.
 *
 * Idempotent: checks for existing categories by handle before creating.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/categorize-products.ts
 */
export default async function categorizeProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModule = container.resolve(Modules.PRODUCT);

  logger.info("=== Sericia categorize-products start ===");

  const CATEGORIES: Array<{
    handle: string;
    name: string;
    description: string;
  }> = [
    {
      handle: "tea",
      name: "Tea",
      description:
        "Single-origin sencha, gyokuro, matcha — small-batch Japanese teas rescued from surplus.",
    },
    {
      handle: "miso",
      name: "Miso",
      description: "Barrel-aged miso from traditional Japanese fermenters.",
    },
    {
      handle: "mushroom",
      name: "Mushroom",
      description: "Sun-dried shiitake and premium Japanese mushrooms.",
    },
    {
      handle: "seasoning",
      name: "Seasoning",
      description: "Yuzu kosho, shio koji, and artisanal seasonings.",
    },
  ];

  // 1. Find or create the 4 categories (idempotent)
  const existing = await (productModule as any).listProductCategories(
    {
      handle: CATEGORIES.map((c) => c.handle),
    },
    { take: 50 },
  );
  const existingByHandle = new Map<string, any>(
    existing.map((c: any) => [c.handle, c]),
  );

  const toCreate = CATEGORIES.filter((c) => !existingByHandle.has(c.handle));

  if (toCreate.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
        })),
      },
    });
    for (const cat of result) {
      existingByHandle.set(cat.handle, cat);
      logger.info(`[category] created ${cat.handle} (${cat.id})`);
    }
  } else {
    logger.info("[category] all 4 categories already exist");
  }

  // 2. Map product handles → category handles
  const PRODUCT_CATEGORY: Record<string, string> = {
    "product-sencha": "tea",
    "product-miso": "miso",
    "product-shiitake": "mushroom",
    "drop-001-tea-miso-shiitake": "seasoning",
  };

  // 3. Fetch products by handle and attach category
  const products = await (productModule as any).listProducts(
    { handle: Object.keys(PRODUCT_CATEGORY) },
    { take: 50, relations: ["categories"] },
  );

  const updates = products
    .map((p: any) => {
      const categoryHandle = PRODUCT_CATEGORY[p.handle];
      const targetCat = existingByHandle.get(categoryHandle);
      if (!targetCat) return null;
      const alreadyLinked = p.categories?.some(
        (c: any) => c.id === targetCat.id,
      );
      if (alreadyLinked) {
        logger.info(`[product] ${p.handle} already in ${categoryHandle}`);
        return null;
      }
      return {
        id: p.id,
        categories: [{ id: targetCat.id }],
      };
    })
    .filter(Boolean);

  if (updates.length > 0) {
    await updateProductsWorkflow(container).run({
      input: { products: updates },
    });
    for (const u of updates) {
      logger.info(`[product] linked ${u.id} to category`);
    }
  } else {
    logger.info("[product] all already categorized");
  }

  // 4. Set published status (no-op if already published — belt & braces)
  await updateProductsWorkflow(container).run({
    input: {
      products: products
        .filter((p: any) => p.status !== ProductStatus.PUBLISHED)
        .map((p: any) => ({ id: p.id, status: ProductStatus.PUBLISHED })),
    },
  });

  logger.info("=== Sericia categorize-products done ===");
}
