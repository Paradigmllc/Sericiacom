export const CATEGORIES = {
  tea: "Tea", miso: "Miso", mushroom: "Mushrooms", seasoning: "Seasonings",
  pantry: "Pantry", tableware: "Tableware", home: "Home & living",
  stationery: "Stationery", textiles: "Textiles", gifts: "Gifts", other: "Other discoveries",
} as const;
export type CategoryKey = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
export function categoryLabel(category: CategoryKey): string { return CATEGORIES[category]; }
export function inferCategory(product: { categories?: { handle: string }[] }): CategoryKey {
  // Only supplier/editor classification is evidence; a product name is not a category.
  return CATEGORY_KEYS.find(key => product.categories?.some(category => category.handle === key)) ?? "other";
}
