"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import ContentSidebar from "../../../components/ContentSidebar";
import { Container, Eyebrow, Rule } from "../../../components/ui";

type Method = "cold-overnight" | "cold-6h" | "warm-30min" | "boiling-15min";

const METHOD_NOTES: Record<Method, { label: string; hours: number; waterRatio: number; note: string; score: string }> = {
  "cold-overnight": {
    label: "Cold water overnight (recommended)",
    hours: 8,
    waterRatio: 4,
    note: "Place shiitake in cold water in the refrigerator (4°C) 8–12 hours. Maximum guanylate release — the compound that gives dashi its depth. Use the soaking liquid.",
    score: "Best flavour — 100% guanylate extraction.",
  },
  "cold-6h": {
    label: "Cold water at room temperature",
    hours: 6,
    waterRatio: 4,
    note: "Cover with cold water at room temperature for 6 hours. Slightly less flavour than refrigerated, but works for same-day cooking.",
    score: "~85% guanylate extraction.",
  },
  "warm-30min": {
    label: "Warm water (40°C)",
    hours: 0.5,
    waterRatio: 4,
    note: "Quick fix when time is tight. Warm water at 40°C rehydrates in 30 minutes but breaks down some of the glutamate enzymes before they work. Acceptable, not optimal.",
    score: "~60% guanylate extraction.",
  },
  "boiling-15min": {
    label: "Boiling water (not recommended)",
    hours: 0.25,
    waterRatio: 4,
    note: "Rehydrates in 15 minutes but destroys the umami enzymes. Use only if you're discarding the soaking liquid.",
    score: "~25% guanylate extraction — avoid for dashi.",
  },
};

export default function ShiitakeRehydrate() {
  const [method, setMethod] = useState<Method>("cold-overnight");
  const [driedG, setDriedG] = useState(30);
  const m = METHOD_NOTES[method];
  const computed = useMemo(() => {
    const waterMl = driedG * m.waterRatio * 10;
    const finishedG = Math.round(driedG * 4.5);
    return { waterMl, finishedG };
  }, [driedG, m]);

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
            <span>Shiitake Rehydration</span>
          </nav>
          <Eyebrow>Tool seven</Eyebrow>
          <h1 className="text-[40px] md:text-[56px] leading-[1.08] font-normal tracking-tight max-w-4xl">
            Dried shiitake rehydration guide.
          </h1>
          <p className="mt-8 text-[18px] text-sericia-ink-soft max-w-prose leading-relaxed">
            Cold water overnight extracts four times the guanylate of boiling. The right method matters more than the right mushroom.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <div className="border border-sericia-line bg-sericia-paper-card p-8 md:p-10">
              <label className="block mb-8">
                <span className="label block mb-4">Method</span>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as Method)}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px] cursor-pointer"
                >
                  {(Object.keys(METHOD_NOTES) as Method[]).map((k) => (
                    <option key={k} value={k}>{METHOD_NOTES[k].label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label block mb-4">Dried shiitake (g)</span>
                <input
                  type="number"
                  min={5}
                  max={500}
                  step={5}
                  value={driedG}
                  onChange={(e) => setDriedG(Math.max(5, Math.min(500, Number(e.target.value) || 0)))}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px]"
                />
              </label>
            </div>

            <Rule className="my-12" />

            <Eyebrow>Rehydration plan</Eyebrow>
            <div className="grid grid-cols-3 gap-8 mb-10">
              <Stat value={`${computed.waterMl}ml`} label="Cold water" />
              <Stat value={m.hours >= 1 ? `${m.hours}h` : `${Math.round(m.hours * 60)} min`} label="Time" />
              <Stat value={`${computed.finishedG}g`} label="Finished weight" />
            </div>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose mb-4">{m.note}</p>
            <p className="text-[13px] tracking-[0.18em] uppercase text-sericia-ink-mute">{m.score}</p>

            <Rule className="my-12" />
            <h2 id="tldr" className="text-[22px] md:text-[26px] font-normal tracking-tight mb-4">TL;DR</h2>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">
              Drop 30g dried shiitake in 1.2 litres of cold water. Refrigerate overnight. Keep the soaking liquid — that's your
              vegan dashi base, richer than kombu alone. The mushrooms themselves are ready for simmering, braising, or the classic
              nimono with carrot and konnyaku. Sericia's donko variety comes from Oita prefecture, sun-dried on bamboo racks.
            </p>
          </div>

          <ContentSidebar
            sectionTitle="In this tool"
            sections={[{ href: "#tldr", label: "TL;DR" }]}
            relatedTools={[
              { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
              { href: "/tools/shelf-life", label: "Shelf-life checker" },
              { href: "/tools/ems-calculator", label: "EMS shipping calculator" },
            ]}
            relatedGuides={[
              { href: "/journal/shiitake-grades", label: "Donko, koshin, and everything between" },
              { href: "/journal/vegan-dashi", label: "Vegan dashi that actually tastes like dashi" },
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
