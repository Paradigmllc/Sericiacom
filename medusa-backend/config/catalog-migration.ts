import { z } from "@medusajs/framework/zod";

const pageInfo = z.object({ hasNextPage: z.boolean() });
const snapshotSchema = z.object({
  shop: z.object({ currencyCode: z.string().regex(/^[A-Z]{3}$/, "Invalid source currency") }),
  products: z.object({
    pageInfo,
    nodes: z.array(z.object({
      id: z.string().min(1), title: z.string().min(1), handle: z.string().min(1),
      descriptionHtml: z.string(),
      options: z.array(z.object({name: z.string().min(1), values: z.array(z.string()).min(1)})).min(1),
      images: z.object({pageInfo, nodes: z.array(z.object({url: z.string().url()}))}),
      variants: z.object({pageInfo, nodes: z.array(z.object({
        id: z.string().min(1), title: z.string(), sku: z.string().nullable(), price: z.string(),
        selectedOptions: z.array(z.object({name: z.string(), value: z.string()})),
      })).min(1)}),
    })).max(100),
  }),
});

// Produce draft-only inputs. Stock and image rights require separate verification.
export function planCatalogMigration(input: unknown) {
  const snapshot = snapshotSchema.parse(input);
  if (!/^[A-Z]{3}$/.test(snapshot.shop.currencyCode)) throw new Error("Invalid source currency");
  if (snapshot.products.pageInfo.hasNextPage) throw new Error("Incomplete product export");
  const handles = new Set<string>();
  const skus = new Set<string>();
  return snapshot.products.nodes.map((product) => {
    if (product.variants.pageInfo.hasNextPage || product.images.pageInfo.hasNextPage) {
      throw new Error("Incomplete product detail export");
    }
    if (!product.id || !product.title || !product.handle || handles.has(product.handle)) {
      throw new Error("Missing or duplicate product identity");
    }
    handles.add(product.handle);
    if (!product.variants.nodes.length) throw new Error("Product has no variants");
    return {
      title: product.title, handle: product.handle, status: "draft" as const,
      metadata: {
        shopify_product_id: product.id,
        source_description_html: product.descriptionHtml,
        source_image_urls: product.images.nodes.map((image) => image.url),
        sourcing_verified: false, image_rights_verified: false,
      },
      options: product.options.map((option) => ({ title: option.name, values: option.values })),
      variants: product.variants.nodes.map((variant) => {
        if (!/^\d+(\.\d+)?$/.test(variant.price) || !Number.isFinite(Number(variant.price))) {
          throw new Error("Invalid variant price");
        }
        if (variant.sku && skus.has(variant.sku)) throw new Error("Duplicate variant SKU");
        if (variant.sku) skus.add(variant.sku);
        for (const selected of variant.selectedOptions) {
          if (!product.options.some((option) => option.name === selected.name && option.values.includes(selected.value))) {
            throw new Error("Variant option is not declared on product");
          }
        }
        return {
          title: variant.title, ...(variant.sku ? { sku: variant.sku } : {}),
          manage_inventory: true, allow_backorder: false,
          options: Object.fromEntries(variant.selectedOptions.map((o) => [o.name, o.value])),
          // Both Shopify price strings and Medusa v2 prices use major currency units.
          prices: [{ currency_code: snapshot.shop.currencyCode.toLowerCase(), amount: Number(variant.price) }],
          metadata: { shopify_variant_id: variant.id },
        };
      }),
    };
  });
}
