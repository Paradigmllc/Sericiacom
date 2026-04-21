"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import ContentSidebar from "../../../components/ContentSidebar";
import { Container, Eyebrow, Rule } from "../../../components/ui";

type Style = "ichiban" | "niban" | "awase" | "kombu" | "iriko" | "shiitake";

const STYLES: Record<Style, { label: string; kombu: number; katsuo: number; iriko: number; shiitake: number; note: string; best: string }> = {
  ichiban: {
    label: "Ichiban dashi (first extraction)",
    kombu: 10,
    katsuo: 20,
    iriko: 0,
    shiitake: 0,
    note: "Clear, gold-tinted, delicate. Kombu soaked cold 30–60 min, brought to 60–65°C, removed; katsuobushi added off-heat and strained within 60 seconds.",
    best: "Clear soups, chawanmushi, refined broths.",
  },
  niban: {
    label: "Niban dashi (second extraction)",
    kombu: 10,
    katsuo: 10,
    iriko: 0,
    shiitake: 0,
    note: "Re-simmer the used kombu and katsuo from ichiban in fresh water for 10 minutes with a small top-up of katsuobushi. Deeper, slightly smoky.",
    best: "Miso soup, simmered dishes, nimono.",
  },
  awase: {
    label: "Awase dashi (household blend)",
    kombu: 8,
    katsuo: 15,
    iriko: 0,
    shiitake: 0,
    note: "A simplified ichiban. Cold-soak kombu for 20 min, bring to near-boil, add katsuobushi off-heat for 90 seconds, strain.",
    best: "Everyday use — miso soup, egg dishes, udon.",
  },
  kombu: {
    label: "Kombu dashi (vegan)",
    kombu: 15,
    katsuo: 0,
    iriko: 0,
    shiitake: 0,
    note: "Cold brew overnight (8–12 h) or warm at 60°C for 1 hour. Never boil kombu — it turns slimy and bitter.",
    best: "Vegan cooking, delicate fish, tofu dishes.",
  },
  iriko: {
    label: "Iriko dashi (sardine)",
    kombu: 5,
    katsuo: 0,
    iriko: 15,
    shiitake: 0,
    note: "Remove heads and black innards from iriko. Cold-soak with kombu for 30 min, simmer 7 minutes. Bold, slightly fishy.",
    best: "Udon broths, hearty miso soups, country cooking.",
  },
  shiitake: {
    label: "Shiitake dashi (vegan, deep)",
    kombu: 5,
    katsuo: 0,
    iriko: 0,
    shiitake: 15,
    note: "Cold-brew dried shiitake overnight in refrigerator. Combine with kombu for full-bodied vegan dashi. Do not discard the mushrooms — reuse in nimono.",
    best: "Vegan ramen, winter stews, noodle dipping sauce.",
  },
};

export default function DashiRatio() {
  const [style, setStyle] = useState<Style>("awase");
  const [water, setWater] = useState(1000); // ml
  const s = STYLES[style];
  const ratios = useMemo(() => {
    const f = water / 1000;
    return {
      kombu: Math.round(s.kombu * f),
      katsuo: Math.round(s.katsuo * f),
      iriko: Math.round(s.iriko * f),
      shiitake: Math.round(s.shiitake * f),
    };
  }, [water, s]);

  return (
    <>
      <SiteHeader />
      <section className="border-b border-sericia-line bg-sericia-paper-card">
        <Container size="wide" className="py-20 md:py-28">
          <nav className="text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute mb-6">
            <Link href="/" className="hover:text-sericia-ink">Sericia</Link>
            <span className="mx-3">·</span>
            <Link href="/tools" className="hover:text-sericia-ink">Tools</Link>
            <span className="mx-3">·</span>
            <span>Dashi Ratio Calculator</span>
          </nav>
          <Eyebrow>Tool five</Eyebrow>
          <h1 className="text-[40px] md:text-[56px] leading-[1.08] font-normal tracking-tight max-w-4xl">
            Dashi ratio calculator.
          </h1>
          <p className="mt-8 text-[18px] text-sericia-ink-soft max-w-prose leading-relaxed">
            Ichiban, niban, kombu, iriko, shiitake — exact gram ratios for any volume of water.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <div className="border border-sericia-line bg-sericia-paper-card p-8 md:p-10">
              <label className="block mb-8">
                <span className="label block mb-4">Style</span>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as Style)}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px] cursor-pointer"
                >
                  {(Object.keys(STYLES) as Style[]).map((k) => (
                    <option key={k} value={k}>{STYLES[k].label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label block mb-4">Water (ml)</span>
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={100}
                  value={water}
                  onChange={(e) => setWater(Math.max(100, Math.min(5000, Number(e.target.value) || 0)))}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px]"
                />
              </label>
            </div>

            <Rule className="my-12" />

            <Eyebrow>Exact ratio</Eyebrow>
            <div className="grid grid-cols-2 gap-8 mb-10">
              {ratios.kombu > 0 && <Stat value={`${ratios.kombu}g`} label="Kombu" />}
              {ratios.katsuo > 0 && <Stat value={`${ratios.katsuo}g`} label="Katsuobushi" />}
              {ratios.iriko > 0 && <Stat value={`${ratios.iriko}g`} label="Iriko" />}
              {ratios.shiitake > 0 && <Stat value={`${ratios.shiitake}g`} label="Dried shiitake" />}
              <Stat value={`${water}ml`} label="Water" />
            </div>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">{s.note}</p>
            <p className="mt-4 text-[13px] tracking-[0.18em] uppercase text-sericia-ink-mute">
              Best for: {s.best}
            </p>

            <Rule className="my-12" />
            <h2 id="tldr" className="text-[22px] md:text-[26px] font-normal tracking-tight mb-4">TL;DR</h2>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">
              For 1 litre of awase dashi — the household default — use 8g kombu and 15g katsuobushi. Cold-soak kombu 20 minutes,
              bring to near-boil, remove kombu, add katsuobushi off-heat for 90 seconds, strain through muslin.
              Sericia sources Rausu kombu (Hokkaido) and honkarebushi katsuobushi aged 2+ years.
            </p>
          </div>

          <ContentSidebar
            sectionTitle="In this tool"
            sections={[{ href: "#tldr", label: "TL;DR" }]}
            relatedTools={[
              { href: "/tools/ems-calculator", label: "EMS shipping calculator" },
              { href: "/tools/shelf-life", label: "Shelf-life checker" },
              { href: "/tools/matcha-grade", label: "Matcha grade decoder" },
            ]}
            relatedGuides={[
              { href: "/journal/dashi-fundamentals", label: "Dashi fundamentals" },
              { href: "/journal/kombu-regions", label: "Kombu regions of Hokkaido" },
              { href: "/journal/katsuobushi-aging", label: "Katsuobushi: why 2-year aging matters" },
            ]}
          />
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[36px] md:text-[44px] font-normal leading-none mb-2 tabular-nums">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
