"use client";
import { useState } from "react";
import Link from "next/link";

type MisoType = "shiro" | "aka" | "awase" | "hatcho" | "saikyo";

const DISHES = [
  { val: "soup-light", label: "Light miso soup (breakfast)", pick: "shiro" as MisoType },
  { val: "soup-hearty", label: "Hearty winter miso soup", pick: "aka" as MisoType },
  { val: "ramen", label: "Miso ramen broth", pick: "awase" as MisoType },
  { val: "glaze", label: "Fish / eggplant glaze", pick: "saikyo" as MisoType },
  { val: "marinade", label: "Meat marinade", pick: "hatcho" as MisoType },
  { val: "dressing", label: "Salad dressing / dip", pick: "shiro" as MisoType },
  { val: "pickle", label: "Vegetable pickling (miso-zuke)", pick: "saikyo" as MisoType },
  { val: "stew", label: "Slow-cooked stew", pick: "hatcho" as MisoType },
];

const MISO_INFO: Record<MisoType, { name: string; region: string; age: string; flavor: string; tip: string }> = {
  shiro: {
    name: "Shiro Miso (白味噌 / White Miso)",
    region: "Kyoto, Kansai region",
    age: "2 weeks – 3 months",
    flavor: "Sweet, mild, low salt. High rice-koji ratio.",
    tip: "Don't boil — add after heat is off to preserve aroma & probiotics.",
  },
  aka: {
    name: "Aka Miso (赤味噌 / Red Miso)",
    region: "Northern / Eastern Japan",
    age: "1 – 3 years",
    flavor: "Deep umami, salty, robust. Longer fermentation = darker, stronger.",
    tip: "Great for cold-weather dishes and rich broths.",
  },
  awase: {
    name: "Awase Miso (合わせ味噌 / Blended)",
    region: "Nationwide household standard",
    age: "Variable",
    flavor: "Balanced — the safe all-purpose choice. Blend of shiro + aka.",
    tip: "If you only buy one miso, buy this.",
  },
  hatcho: {
    name: "Hatcho Miso (八丁味噌)",
    region: "Okazaki, Aichi (3 producers only)",
    age: "2 – 3 years, soy-only (no rice)",
    flavor: "Intensely dark, rich, slightly bitter. Protein-dense.",
    tip: "Stew-friendly — holds up to long cooking where lighter miso breaks down.",
  },
  saikyo: {
    name: "Saikyo Miso (西京味噌)",
    region: "Kyoto",
    age: "~1 month",
    flavor: "Very sweet, creamy, pale yellow. Aka white miso's refined cousin.",
    tip: "Classic fish marinade — coat silver cod for 2 days, grill.",
  },
};

export default function MisoFinder() {
  const [dish, setDish] = useState<string>("");
  const pick = DISHES.find((d) => d.val === dish)?.pick;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-serif">
      <nav className="mb-8 text-sm text-sericia-ink/60">
        <Link href="/" className="hover:underline">Sericia</Link> / <Link href="/tools" className="hover:underline">Tools</Link> / Miso Finder
      </nav>

      <h1 className="mb-4 text-4xl font-bold">Miso Type Finder</h1>
      <p className="mb-10 text-lg text-sericia-ink/80">
        Japan has dozens of miso varieties. Pick the dish you're making and we'll match the right one.
      </p>

      <div className="rounded-xl border border-sericia-ink/10 bg-sericia-paper p-6">
        <div className="mb-3 font-semibold">What are you making?</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {DISHES.map((d) => (
            <button key={d.val} onClick={() => setDish(d.val)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                dish === d.val
                  ? "border-sericia-accent bg-sericia-accent/10"
                  : "border-sericia-ink/10 bg-white hover:border-sericia-accent/30"
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {pick && (
        <div className="mt-10 rounded-xl bg-sericia-accent/10 p-8">
          <div className="mb-2 text-sm uppercase tracking-wider text-sericia-ink/60">Recommended</div>
          <h2 className="mb-4 text-2xl font-bold text-sericia-accent">{MISO_INFO[pick].name}</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold">Region:</dt><dd>{MISO_INFO[pick].region}</dd></div>
            <div><dt className="font-semibold">Fermentation:</dt><dd>{MISO_INFO[pick].age}</dd></div>
            <div><dt className="font-semibold">Flavor:</dt><dd>{MISO_INFO[pick].flavor}</dd></div>
            <div><dt className="font-semibold">Pro tip:</dt><dd>{MISO_INFO[pick].tip}</dd></div>
          </dl>
        </div>
      )}
    </main>
  );
}
