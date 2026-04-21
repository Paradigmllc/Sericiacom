"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import { useUi } from "@/lib/ui-store";
import { CloseIcon, SearchIcon } from "./Icons";

type Item = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_usd: number;
  weight_g: number;
  category: string;
  origin_region: string | null;
  producer_name: string | null;
  image: string | null;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  tea: "from-[#c8d4b0] to-[#6a7d4c]",
  miso: "from-[#d4c9b0] to-[#7a5c3c]",
  mushroom: "from-[#c8b8a8] to-[#5a4a3c]",
  seasoning: "from-[#e0d4a8] to-[#8a7a2c]",
};

export default function SearchModal() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global hotkey: /  or  cmd+k
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      const isMetaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (isMetaK || isSlash) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Lazy load catalog when first opened
  useEffect(() => {
    if (!open) return;
    if (items.length > 0) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/products/search-index", { cache: "force-cache" })
      .then((r) => r.json())
      .then((data: { products?: Item[] }) => {
        if (cancelled) return;
        setItems(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) => {
        console.error("[search] index load failed", err);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, items.length]);

  // Focus on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (listRef.current) autoAnimate(listRef.current);
  }, [open]);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "producer_name", weight: 0.2 },
        { name: "origin_region", weight: 0.15 },
        { name: "category", weight: 0.1 },
        { name: "description", weight: 0.05 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    return fuse.search(query.trim(), { limit: 10 }).map((r) => r.item);
  }, [query, fuse, items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] bg-sericia-ink/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="mx-auto mt-[10vh] w-[min(92vw,640px)] bg-sericia-paper shadow-[0_30px_80px_-20px_rgba(33,35,29,0.35)]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-sericia-line px-5 py-4">
              <SearchIcon className="h-5 w-5 text-sericia-ink-mute" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tea, miso, producer, region…"
                className="flex-1 bg-transparent outline-none text-[15px] text-sericia-ink placeholder:text-sericia-ink-mute"
                aria-label="Search products"
              />
              <kbd className="hidden sm:inline-block text-[10px] tracking-[0.18em] uppercase border border-sericia-line px-2 py-0.5 text-sericia-ink-mute">
                Esc
              </kbd>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="sm:hidden p-1 text-sericia-ink-mute hover:text-sericia-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto"
            >
              {loading && items.length === 0 ? (
                <div className="space-y-2 p-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-14 w-14 bg-sericia-paper-card" />
                      <div className="flex-1 space-y-2 py-2">
                        <div className="h-3 w-1/2 bg-sericia-paper-card" />
                        <div className="h-3 w-1/4 bg-sericia-paper-card" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-sericia-ink-soft">
                  No matches. Try another keyword.
                </div>
              ) : (
                <ul>
                  {results.map((r) => (
                    <li key={r.id} className="border-b border-sericia-line last:border-b-0">
                      <Link
                        href={`/products/${r.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-sericia-paper-card transition-colors"
                      >
                        <div
                          className={`h-14 w-14 shrink-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[r.category] ?? "from-sericia-line to-sericia-ink-mute"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] tracking-[0.18em] uppercase text-sericia-ink-mute">
                            {r.category}
                            {r.origin_region ? ` · ${r.origin_region}` : ""}
                          </p>
                          <p className="text-[14px] text-sericia-ink truncate">{r.name}</p>
                        </div>
                        <span className="text-[13px] tabular-nums text-sericia-ink">
                          ${r.price_usd}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-sericia-line bg-sericia-paper-card px-5 py-2.5 text-[10px] tracking-[0.18em] uppercase text-sericia-ink-mute flex items-center justify-between">
              <span>{items.length} products in catalog</span>
              <span>Fuzzy search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
