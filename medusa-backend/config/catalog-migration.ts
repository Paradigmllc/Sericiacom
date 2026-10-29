type Snapshot = {
  shop: { currencyCode: string };
  products: {
    pageInfo: { hasNextPage: boolean };
    nodes: Array<{
      id: string; title: string; handle: string; descriptionHtml: string;
      options: Array<{ name: string; values: string[] }>;
      images: { pageInfo: { hasNextPage: boolean }; nodes: Array<{ url: string }> };
      variants: {
        pageInfo: { hasNextPage: boolean };
        nodes: Array<{
          id: string; title: string; sku: string | null; price: string;
          selectedOptions: Array<{ name: string; value: string }>;
        }>;
      };
    }>;
  };
};

// Produce draft-only inputs. Stock and image rights require separate verification.
export function planCatalogMigration(snapshot: Snapshot) {
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
