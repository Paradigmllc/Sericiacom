"use client";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContentSidebar from "@/components/ContentSidebar";
import { Container, Eyebrow, Rule } from "@/components/ui";

type TeaType = "sencha" | "gyokuro" | "bancha" | "hojicha" | "genmaicha" | "matcha-koicha" | "matcha-usucha";

const PARAMS: Record<TeaType, { label: string; waterTempC: number; steepSeconds: number; leafPerMl: number; note: string }> = {
  sencha: {
    label: "Sencha",
    waterTempC: 75,
    steepSeconds: 60,
    leafPerMl: 3 / 100,
    note: "Cool boiling water to ~75°C before pouring. Decant fully — the last drop carries the sweetness. A second steep (80°C, 15 s) is shorter.",
  },
  gyokuro: {
    label: "Gyokuro (shaded)",
    waterTempC: 55,
    steepSeconds: 120,
    leafPerMl: 4 / 60,
    note: "The gentlest, sweetest Japanese green. Low temperature reveals umami; high temperature destroys it. Small volume, concentrated.",
  },
  bancha: {
    label: "Bancha",
    waterTempC: 85,
    steepSeconds: 45,
    leafPerMl: 3 / 100,
    note: "Everyday green — forgiving and bright. Higher temperature tolerated. Good cold-brewed in summer.",
  },
  hojicha: {
    label: "Hojicha (roasted)",
    waterTempC: 95,
    steepSeconds: 30,
    leafPerMl: 3 / 100,
    note: "Low caffeine, toasty. Near-boiling water. Steeps fast. Excellent iced with a slice of yuzu peel.",
  },
  genmaicha: {
    label: "Genmaicha (rice-blended)",
    waterTempC: 90,
    steepSeconds: 45,
    leafPerMl: 3 / 100,
    note: "Popped brown rice balances the tannin. Near-boiling water, short steep. The rice aroma fades after the second steep.",
  },
  "matcha-usucha": {
    label: "Matcha — usucha (thin)",
    waterTempC: 75,
    steepSeconds: 0,
    leafPerMl: 2 / 70,
    note: "Thin, foamy, everyday matcha. Whisk 2g matcha with 70ml water at 75°C in a zig-zag motion for ~15 seconds until a foam forms.",
  },
  "matcha-koicha": {
    label: "Matcha — koicha (thick)",
    waterTempC: 75,
    steepSeconds: 0,
    leafPerMl: 4 / 30,
    note: "Ceremonial thick matcha. 4g matcha with just 30ml water at 75°C, kneaded rather than whisked. Reserved for ceremonial-grade matcha only.",
  },
};

export default function TeaBrewer() {
  const [tea, setTea] = useState<TeaType>("sencha");
  const [cupMl, setCupMl] = useState(150);
  const p = PARAMS[tea];
  const leafG = Math.max(0.5, Math.round(cupMl * p.leafPerMl * 10) / 10);

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
            <span>Japanese Tea Brewer</span>
          </nav>
          <Eyebrow>Tool six</Eyebrow>
          <h1 className="text-[40px] md:text-[56px] leading-[1.08] font-normal tracking-tight max-w-4xl">
            Japanese tea brewing calculator.
          </h1>
          <p className="mt-8 text-[18px] text-sericia-ink-soft max-w-prose leading-relaxed">
            Temperature, time, and leaf weight — the three variables that ruin most sencha in the West.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <div className="border border-sericia-line bg-sericia-paper-card p-8 md:p-10">
              <label className="block mb-8">
                <span className="label block mb-4">Tea</span>
                <select
                  value={tea}
                  onChange={(e) => setTea(e.target.value as TeaType)}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px] cursor-pointer"
                >
                  {(Object.keys(PARAMS) as TeaType[]).map((k) => (
                    <option key={k} value={k}>{PARAMS[k].label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label block mb-4">Cup size (ml)</span>
                <input
                  type="number"
                  min={30}
                  max={1000}
                  step={10}
                  value={cupMl}
                  onChange={(e) => setCupMl(Math.max(30, Math.min(1000, Number(e.target.value) || 0)))}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px]"
                />
              </label>
            </div>

            <Rule className="my-12" />

            <Eyebrow>Brew this</Eyebrow>
            <div className="grid grid-cols-3 gap-8 mb-10">
              <Stat value={`${p.waterTempC}°C`} label="Water temp" />
              <Stat value={p.steepSeconds === 0 ? "Whisk" : `${p.steepSeconds}s`} label="Steep" />
              <Stat value={`${leafG}g`} label="Leaf" />
            </div>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">{p.note}</p>

            <Rule className="my-12" />
            <h2 id="tldr" className="text-[22px] md:text-[26px] font-normal tracking-tight mb-4">TL;DR</h2>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">
              Sencha at 75°C for 60 seconds, 3g per 100ml. Gyokuro at 55°C for 2 minutes. Hojicha at near-boiling for 30 seconds.
              The mistake 9 out of 10 Western kitchens make is boiling water straight onto sencha leaves — the result is
              bitter tannins and a flat, yellow-brown cup. Cool the water first.
            </p>
          </div>

          <ContentSidebar
            sectionTitle="In this tool"
            sections={[{ href: "#tldr", label: "TL;DR" }]}
            relatedTools={[
              { href: "/tools/matcha-grade", label: "Matcha grade decoder" },
              { href: "/tools/shelf-life", label: "Shelf-life checker" },
              { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
            ]}
            relatedGuides={[
              { href: "/journal/sencha-regions", label: "Single-origin sencha regions" },
              { href: "/journal/matcha-grading", label: "Matcha: ceremonial vs. culinary" },
              { href: "/journal/water-temperature", label: "Why water temperature ruins most tea" },
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
      <div className="text-[28px] md:text-[36px] font-normal leading-none mb-2 tabular-nums">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
