import { NextResponse } from "next/server";
import { listActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const products = await listActiveProducts();
    const index = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price_usd: p.price_usd,
      weight_g: p.weight_g,
      category: p.category,
      origin_region: p.origin_region,
      producer_name: p.producer_name,
      image: p.images?.[0] ?? null,
    }));
    return NextResponse.json(
      { products: index, updatedAt: Date.now() },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error("[search-index]", err);
    return NextResponse.json({ products: [], error: "failed" }, { status: 500 });
  }
}
