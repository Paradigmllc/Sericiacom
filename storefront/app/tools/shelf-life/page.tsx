"use client";
import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { val: "sencha", label: "Sencha (green tea, sealed)", pantry: 730, open: 90, note: "Nitrogen-flushed vacuum packs hold 2 years unopened. Once opened, oxidation accelerates — finish within 3 months for peak flavor." },
  { val: "matcha", label: "Matcha powder (sealed)", pantry: 365, open: 30, note: "Once opened, matcha loses vibrancy within weeks. Refrigerate to slow oxidation but warm to room temp before whisking." },
  { val: "miso-shiro", label: "Shiro (white) miso, unopened", pantry: 365, open: 60, note: "Short fermentation = shorter shelf life. Refrigerate after opening; surface discoloration is harmless but flavor fades." },
  { val: "miso-aka", label: "Aka (red) / Hatcho miso, unopened", pantry: 1095, open: 365, note: "Long-aged miso is nearly indestructible. Refrigerated, stays usable for a year+ after opening — flavor deepens." },
  { val: "shiitake", label: "Dried shiitake (sealed)", pantry: 1095, open: 180, note: "Store cool & dry. Vacuum-sealed lasts 3+ years. After opening, an airtight jar + silica pack gives 6 months." },
  { val: "dashi-granule", label: "Granulated dashi (sealed)", pantry: 545, open: 180, note: "Keep dry — humidity causes clumping but not spoilage. 18 months sealed, 6 months after opening." },
  { val: "yuzu-kosho", label: "Yuzu kosho paste", pantry: 365, open: 90, note: "Refrigerate after opening. Oil separation is normal — stir before use. Color darkens over time, flavor stays bright." },
  { val: "shichimi", label: "Shichimi togarashi", pantry: 365, open: 120, note: "Aromatics (yuzu peel, nori) fade fastest. Replace when the scent is gone even if spice remains." },
  { val: "furikake", label: "Furikake rice seasoning", pantry: 545, open: 180, note: "Sesame & nori fade first. Small single-serve packets preserve freshness best." },
];

function daysToHuman(d: number): string {
  if (d < 60) return `${d} days`;
  if (d < 365) return `${Math.round(d / 30)} months`;
  return `${(d / 365).toFixed(1)} years`;
}

export default function ShelfLife() {
  const [item, setItem] = useState(ITEMS[0].val);
  const [opened, setOpened] = useState(false);
  const info = ITEMS.find((i) => i.val === item)!;
  const days = opened ? info.open : info.pantry;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-serif">
      <nav className="mb-8 text-sm text-sericia-ink/60">
        <Link href="/" className="hover:underline">Sericia</Link> / <Link href="/tools" className="hover:underline">Tools</Link> / Shelf-Life Checker
      </nav>

      <h1 className="mb-4 text-4xl font-bold">Japanese Food Shelf-Life Checker</h1>
      <p className="mb-10 text-lg text-sericia-ink/80">
        How long does miso really keep? Sencha, shiitake, matcha — real numbers, not guesses.
      </p>

      <div className="rounded-xl border border-sericia-ink/10 bg-sericia-paper p-6">
        <label className="mb-6 block">
          <span className="mb-2 block font-semibold">What do you have?</span>
          <select value={item} onChange={(e) => setItem(e.target.value)}
            className="w-full rounded-lg border border-sericia-ink/20 bg-white px-4 py-3">
            {ITEMS.map((i) => <option key={i.val} value={i.val}>{i.label}</option>)}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={opened} onChange={(e) => setOpened(e.target.checked)}
            className="h-5 w-5 accent-sericia-accent" />
          <span>Package has been opened</span>
        </label>
      </div>

      <div className="mt-10 rounded-xl bg-sericia-accent/10 p-8">
        <div className="mb-2 text-sm uppercase tracking-wider text-sericia-ink/60">Expected shelf life</div>
        <div className="text-4xl font-bold text-sericia-accent">{daysToHuman(days)}</div>
        <div className="mt-1 text-sm text-sericia-ink/60">({days} days at proper storage)</div>
        <p className="mt-6 text-sm text-sericia-ink/80">{info.note}</p>
      </div>

      <p className="mt-8 text-xs text-sericia-ink/50">
        Estimates based on Japan Agricultural Standards (JAS) and producer-declared best-by windows. Sensory check always
        wins: mold, off-odor, or drastic color change = discard regardless of date.
      </p>
    </main>
  );
}
