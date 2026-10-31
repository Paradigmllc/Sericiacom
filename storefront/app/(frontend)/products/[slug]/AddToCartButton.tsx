"use client";
import { formatMoney } from "@/lib/money";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-store";
import { useUi } from "@/lib/ui-store";
import { useWishlist } from "@/lib/wishlist-store";
import { MinusIcon, PlusIcon } from "@/components/Icons";
import AnimatedHeart from "@/components/AnimatedHeart";

export default function AddToCartButton({
  variants,
  productId,
  name,
  slug,
  priceAmount,
  currency,
  outOfStock,
  category,
  onNotifyClick,
}: {
  variants: import("@/lib/products").ProductVariant[];
  productId: string;
  name: string;
  slug: string;
  priceAmount: number;
  currency: string;
  outOfStock: boolean;
  category: string;
  onNotifyClick?: () => void;
}) {
  const tA11y = useTranslations("common.a11y");
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.has(productId));
  const [qty, setQty] = useState(1);

  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const selected = variants.find(v => v.id === variantId);
  const available = !!selected && selected.stock >= qty;

  function handleAdd() {
    try {
      if (!selected || !available) throw new Error("This option is unavailable in the selected quantity.");
      add({ productId, variantId: selected.id, name: `${name} — ${selected.title}`, slug, price: selected.price, currency: selected.currency, quantity: qty, image: null });
      toast.success(`Added to cart — ${name}`);
      // Brief delay so the toast is perceivable before drawer opens
      setTimeout(() => openCart(), 120);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[add-to-cart]", err);
      toast.error(msg);
    }
  }

  function handleWish() {
    try {
      const added = toggleWish({ productId, slug, name, price: priceAmount, currency, category });
      toast.success(added ? `Saved — ${name}` : `Removed — ${name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] toggle", err);
      toast.error(msg);
    }
  }

  if (outOfStock) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onNotifyClick}
          className="w-full border border-sericia-ink bg-sericia-paper py-5 text-[14px] tracking-[0.18em] uppercase hover:bg-sericia-ink hover:text-sericia-paper transition-colors"
        >
          Notify me when available
        </button>
        <button
          type="button"
          onClick={handleWish}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="w-full flex items-center justify-center gap-2 text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute hover:text-sericia-ink transition"
        >
          <AnimatedHeart filled={wished} className="h-4 w-4" />
          {wished ? "Saved" : "Save to wishlist"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        Product option
        <select aria-label="Product option" value={variantId} onChange={e => { setVariantId(e.target.value); setQty(1); }} className="mt-2 w-full border border-sericia-line bg-transparent p-3">
          {variants.map(v => <option key={v.id} value={v.id}>{v.title} — {formatMoney(v.price, v.currency)}{v.stock < 1 ? " — Sold out" : ""}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-6">
        <span className="label">Quantity</span>
        <div className="flex items-center border border-sericia-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label={tA11y("decrease_qty")}
            className="w-10 h-10 flex items-center justify-center text-sericia-ink hover:bg-sericia-paper-card transition"
          >
            <MinusIcon className="h-3 w-3" />
          </button>
          <span className="w-12 text-center text-[14px] tabular-nums" aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label={tA11y("increase_qty")}
            className="w-10 h-10 flex items-center justify-center text-sericia-ink hover:bg-sericia-paper-card transition"
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!available}
          aria-label="Add selected option to cart"
          data-pdp-add-to-cart
          className="bg-sericia-ink text-sericia-paper py-5 text-[14px] tracking-[0.18em] uppercase hover:bg-sericia-accent transition-colors"
        >
          {available ? `Add to cart — ${formatMoney(selected.price * qty, selected.currency)}` : "Selected quantity unavailable"}
        </button>
        <button
          type="button"
          onClick={handleWish}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className={`px-5 border transition-colors ${wished ? "border-sericia-heart" : "border-sericia-line text-sericia-ink-mute hover:border-sericia-ink hover:text-sericia-ink"}`}
        >
          <AnimatedHeart filled={wished} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
