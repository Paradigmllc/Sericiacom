"use client";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContentSidebar from "@/components/ContentSidebar";
import { Container, Eyebrow, Rule } from "@/components/ui";

const DISHES = [
  {
    val: "ponzu",
    label: "Ponzu sauce",
    substitute: "Lemon + lime + a drop of mandarin or orange zest.",
    ratio: "Lemon 60%, lime 30%, mandarin zest 10%.",
    note: "Yuzu's defining quality is a grapefruit-like bitter note with sharp floral aromatics. Lemon alone is too one-dimensional — adding lime plus mandarin rebuilds the complexity.",
  },
  {
    val: "yuzu-kosho",
    label: "Yuzu kosho paste",
    substitute: "Lemon zest + green chilli + salt.",
    ratio: "Zest of 2 lemons + 1 small green chilli + 1 tsp sea salt, muddled and rested 24h.",
    note: "The real paste is fermented with green chilli. A fresh substitute skips fermentation but captures the citrus-heat hit. Rest 24 hours before using.",
  },
  {
    val: "dressings",
    label: "Salad dressings",
    substitute: "Lime juice + grapefruit zest.",
    ratio: "Lime juice 80%, finely grated grapefruit zest 20%.",
    note: "The pink grapefruit contributes yuzu's slight bitterness that lemon can't. Use Key lime where available.",
  },
  {
    val: "dessert",
    label: "Desserts and pastry",
    substitute: "Meyer lemon + a touch of bergamot.",
    ratio: "Meyer lemon 90%, bergamot (earl grey tea) 10%.",
    note: "Meyer lemon's honeyed note is closer to yuzu than regular lemon. A splash of cold-brewed Earl Grey adds the floral register.",
  },
  {
    val: "hot-pot",
    label: "Hot pot / nabe dipping",
    substitute: "Ponzu made from lemon + soy + mirin + katsuobushi.",
    ratio: "4 tbsp lemon juice + 3 tbsp soy + 2 tbsp mirin + 1 tsp katsuobushi, rested 1h.",
    note: "The hot-pot application needs acid + umami, not pure citrus. The ratio here is traditional for yuzu ponzu and works with lemon as the acid driver.",
  },
];

export default function YuzuSubstitute() {
  const [dish, setDish] = useState(DISHES[0].val);
  const d = DISHES.find((x) => x.val === dish)!;

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
            <span>Yuzu Substitute Finder</span>
          </nav>
          <Eyebrow>Tool eight</Eyebrow>
          <h1 className="text-[40px] md:text-[56px] leading-[1.08] font-normal tracking-tight max-w-4xl">
            Yuzu substitute finder.
          </h1>
          <p className="mt-8 text-[18px] text-sericia-ink-soft max-w-prose leading-relaxed">
            Yuzu costs £80 per kilo outside Japan when you can find it fresh. Build the flavour from accessible citrus instead.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <div className="border border-sericia-line bg-sericia-paper-card p-8 md:p-10">
              <label className="block">
                <span className="label block mb-4">What are you making?</span>
                <select
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-sericia-line focus:border-sericia-ink focus:outline-none text-[16px] cursor-pointer"
                >
                  {DISHES.map((x) => <option key={x.val} value={x.val}>{x.label}</option>)}
                </select>
              </label>
            </div>

            <Rule className="my-12" />

            <Eyebrow>Substitute</Eyebrow>
            <p className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight mb-4">{d.substitute}</p>
            <p className="text-[13px] tracking-[0.18em] uppercase text-sericia-ink-mute mb-8">{d.ratio}</p>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">{d.note}</p>

            <Rule className="my-12" />
            <h2 id="tldr" className="text-[22px] md:text-[26px] font-normal tracking-tight mb-4">TL;DR</h2>
            <p className="text-[15px] text-sericia-ink-soft leading-relaxed max-w-prose">
              Yuzu can't be perfectly replaced but it can be approximated. The universal substitute: lemon + lime + grapefruit zest.
              For yuzu kosho, muddle lemon zest, green chilli, and salt. For ponzu, blend lemon juice with soy, mirin, and katsuobushi.
              When you do get authentic yuzu — Sericia ships yuzu products from Kochi prefecture — use it sparingly, the punch is real.
            </p>
          </div>

          <ContentSidebar
            sectionTitle="In this tool"
            sections={[{ href: "#tldr", label: "TL;DR" }]}
            relatedTools={[
              { href: "/tools/miso-finder", label: "Miso type finder" },
              { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
              { href: "/tools/shelf-life", label: "Shelf-life checker" },
            ]}
            relatedGuides={[
              { href: "/journal/yuzu-kosho-varieties", label: "Yuzu kosho: green, red, white" },
              { href: "/journal/kochi-citrus", label: "The citrus prefectures of Japan" },
            ]}
          />
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
