"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useWishlist, type WishlistItem } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useUi } from "@/lib/ui-store";
import { HeartIcon, CloseIcon, BagIcon } from "@/components/Icons";

const CATEGORY_GRADIENTS: Record<string, string> = {
  tea: "from-[#c8d4b0] to-[#6a7d4c]",
  miso: "from-[#d4c9b0] to-[#7a5c3c]",
  mushroom: "from-[#c8b8a8] to-[#5a4a3c]",
  seasoning: "from-[#e0d4a8] to-[#8a7a2c]",
};

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function WishlistClient() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);
  const addToCart = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  const [mounted, setMounted] = useState(false);
  const [listRef] = useAutoAnimate<HTMLDivElement>();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Avoid hydration mismatch from persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  function handleAddAll() {
    if (items.length === 0) return;
    try {
      for (const it of items) {
        addToCart({
          productId: it.productId,
          name: it.name,
          slug: it.slug,
          price_usd: it.price_usd,
          quantity: 1,
          image: null,
        });
      }
      toast.success(`Added ${items.length} item${items.length === 1 ? "" : "s"} to cart`);
      setTimeout(() => openCart(), 150);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] add all", err);
      toast.error(msg);
    }
  }

  function handleAddOne(it: WishlistItem) {
    try {
      addToCart({
        productId: it.productId,
        name: it.name,
        slug: it.slug,
        price_usd: it.price_usd,
        quantity: 1,
        image: null,
      });
      toast.success(`Added to cart — ${it.name}`);
      setTimeout(() => openCart(), 150);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] add one", err);
      toast.error(msg);
    }
  }

  function handleRemove(it: WishlistItem) {
    try {
      remove(it.productId);
      toast.success(`Removed — ${it.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] remove", err);
      toast.error(msg);
    }
  }

  function handleClear() {
    if (items.length === 0) return;
    if (!confirm("Clear your whole wishlist?")) return;
    try {
      clear();
      toast.success("Wishlist cleared");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[wishlist] clear", err);
      toast.error(msg);
    }
  }

  if (!mounted) {
    return (
      <div>
        <p className="label mb-3">Wishlist</p>
        <div className="h-8 w-48 bg-sericia-paper-card animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <p className="label mb-3">Wishlist</p>
        <h1 ref={titleRef} className="text-[28px] md:text-[32px] font-normal leading-tight mb-6">
          Your wishlist is empty.
        </h1>
        <p className="text-[14px] text-sericia-ink-soft leading-relaxed max-w-md mb-10">
          Save the things you love by tapping the heart on any product — they&apos;ll wait for you here until you&apos;re ready.
        </p>
        <Link
          href="/products"
          className="inline-block bg-sericia-ink text-sericia-paper py-4 px-8 text-[13px] tracking-[0.18em] uppercase hover:bg-sericia-accent transition-colors"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="label mb-3">Wishlist</p>
          <h1 className="text-[28px] md:text-[32px] font-normal leading-tight">
            Saved for later
            <span className="ml-3 text-[16px] text-sericia-ink-mute tabular-nums">
              · {items.length}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute hover:text-sericia-ink transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleAddAll}
            className="flex items-center gap-2 bg-sericia-ink text-sericia-paper py-3 px-5 text-[12px] tracking-[0.18em] uppercase hover:bg-sericia-accent transition-colors"
          >
            <BagIcon className="h-4 w-4" />
            Add all to cart
          </button>
        </div>
      </div>

      <div ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 bg-sericia-line gap-px">
        {items.map((it) => {
          const gradient = CATEGORY_GRADIENTS[it.category] ?? "from-sericia-line to-sericia-ink-mute";
          return (
            <motion.div
              key={it.productId}
              layout
              className="relative bg-sericia-paper p-6 hover:bg-sericia-paper-card transition-colors"
            >
              <button
                type="button"
                onClick={() => handleRemove(it)}
                aria-label={`Remove ${it.name} from wishlist`}
                className="absolute top-3 right-3 p-2 text-sericia-ink-mute hover:text-sericia-ink transition"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
              <Link href={`/products/${it.slug}`} data-cursor="link" className="block">
                <div className={`relative aspect-[4/5] bg-gradient-to-br ${gradient} mb-5`}>
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
                    }}
                  />
                  <HeartIcon
                    filled
                    className="absolute top-3 left-3 h-4 w-4 text-sericia-paper/80"
                  />
                </div>
                <p className="label mb-2">{it.category}</p>
                <h3 className="text-[17px] font-normal leading-snug mb-2">{it.name}</h3>
                <p className="text-[12px] text-sericia-ink-mute mb-4">
                  Saved {formatDate(it.addedAt)}
                </p>
                <p className="text-[14px] tabular-nums">${it.price_usd} USD</p>
              </Link>
              <button
                type="button"
                onClick={() => handleAddOne(it)}
                className="mt-5 w-full border border-sericia-ink py-3 text-[12px] tracking-[0.18em] uppercase hover:bg-sericia-ink hover:text-sericia-paper transition-colors"
              >
                Add to cart
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
