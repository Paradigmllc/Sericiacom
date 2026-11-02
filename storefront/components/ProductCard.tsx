"use client";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist-store";
import AnimatedHeart from "./AnimatedHeart";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  weight_g: number;
  category: string;
  origin_region: string | null;
  /** Optional — if passed and low, shows "Only X left" pill on the card */
  stock?: number | null;
  images?: string[];
  /** Aesop-style status pill ("New addition" / "Limited release" / "Beloved formulation") */
  badge?: string | null;
};

// Matches ProductDetailShell threshold so listing + PDP stay in sync
const LOW_STOCK_THRESHOLD = 10;

const CATEGORY_GRADIENTS: Record<string, string> = {
  tea: "from-[#c8d4b0] to-[#6a7d4c]",
  miso: "from-[#d4c9b0] to-[#7a5c3c]",
  mushroom: "from-[#c8b8a8] to-[#5a4a3c]",
  seasoning: "from-[#e0d4a8] to-[#8a7a2c]",
};

const CATEGORY_GRADIENTS_ALT: Record<string, string> = {
  tea: "from-[#6a7d4c] to-[#3f4a28]",
  miso: "from-[#7a5c3c] to-[#3f2c1a]",
  mushroom: "from-[#5a4a3c] to-[#2f241c]",
  seasoning: "from-[#8a7a2c] to-[#4a3f10]",
};

export default function ProductCard({
  product,
  className = "",
  padding = "p-10",
}: {
  product: Product;
  className?: string;
  padding?: string;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const image = product.images?.[0];
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has(product.id));

  function onWish(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = toggle({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        category: product.category,
      });
      toast.success(added ? `Saved — ${product.name}` : `Removed — ${product.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] toggle", err);
      toast.error(msg);
    }
  }

  const primary = CATEGORY_GRADIENTS[product.category] ?? "from-sericia-line to-sericia-ink-mute";
  const secondary = CATEGORY_GRADIENTS_ALT[product.category] ?? "from-sericia-ink-mute to-sericia-ink";
  const showLowStock =
    typeof product.stock === "number" &&
    product.stock > 0 &&
    product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/products/${product.slug}`}
      data-cursor="link"
      className={`group relative block bg-sericia-paper hover:bg-sericia-paper-card transition-colors ${padding} ${className}`}
    >
      <button
        type="button"
        onClick={onWish}
        aria-label={has ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-4 right-4 z-10 p-2 text-sericia-ink-mute hover:text-sericia-ink transition"
      >
        <AnimatedHeart filled={has} className="h-5 w-5" />
      </button>
      {/* Aesop-style category-page status pill (top-left, above image, no backdrop).
          Renders only when `badge` is explicitly provided — most surfaces pass nothing. */}
      {product.badge && (
        <p className="label mb-3 text-sericia-accent">{product.badge}</p>
      )}

      <div className="relative aspect-[4/5] mb-6 overflow-hidden">
        {showLowStock && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-sericia-paper/90 backdrop-blur-sm border border-sericia-line px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase text-sericia-accent">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-sericia-accent" />
            Only {product.stock} left
          </div>
        )}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${primary}`}
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${secondary}`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        {image && failedImage !== image && <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" onError={() => {
          console.error("[product-card] image unavailable", product.id);
          setFailedImage(image);
        }} />}
        {(!image || failedImage === image) && <span className="absolute inset-x-4 bottom-4 text-center text-sm bg-sericia-paper/90 py-2">Image unavailable</span>}
      </div>
      <p className="label mb-3">
        {product.category}
        {product.origin_region ? ` · ${product.origin_region}` : ""}
      </p>
      <h2 className="text-[20px] md:text-[22px] font-normal leading-snug mb-3">{product.name}</h2>
      <p className="text-[13px] text-sericia-ink-soft leading-relaxed line-clamp-2 mb-6">
        {product.description}
      </p>
      <div className="flex items-baseline justify-between pt-4 border-t border-sericia-line">
        <span className="text-[15px] tabular-nums">{formatMoney(product.price, product.currency)}</span>
        <span className="text-[11px] tracking-[0.18em] uppercase text-sericia-ink-mute">
          {product.weight_g > 0 ? `${product.weight_g}g` : ""}
        </span>
      </div>
    </Link>
  );
}
