import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Japanese Food Tools — EMS Calculator, Matcha Grader, Miso Finder | Sericia",
  description: "Free utilities for Japanese craft food buyers: EMS shipping calculator, matcha grade decoder, miso finder, shelf-life checker. Built by Sericia.",
  alternates: { canonical: "https://sericia.com/tools" },
};

const TOOLS = [
  { href: "/tools/ems-calculator", title: "EMS Shipping Calculator", desc: "Estimate Japan Post EMS cost + transit to 23+ countries", icon: "📦" },
  { href: "/tools/matcha-grade", title: "Matcha Grade Decoder", desc: "Ceremonial vs premium vs culinary — which matcha do you actually need?", icon: "🍵" },
  { href: "/tools/miso-finder", title: "Miso Type Finder", desc: "White / red / awase — match the right miso to your dish", icon: "🥣" },
  { href: "/tools/shelf-life", title: "Shelf-Life Checker", desc: "How long does miso / sencha / dried shiitake actually keep?", icon: "📅" },
];

export default function ToolsIndex() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 font-serif">
      <h1 className="mb-4 text-4xl font-bold">Sericia Tools</h1>
      <p className="mb-10 text-lg text-sericia-ink/80">Free utilities for anyone buying authentic Japanese craft food.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-xl border border-sericia-ink/10 bg-sericia-paper p-6 transition hover:border-sericia-accent hover:shadow-md">
            <div className="mb-2 text-3xl">{t.icon}</div>
            <h2 className="mb-1 text-xl font-semibold">{t.title}</h2>
            <p className="text-sm text-sericia-ink/70">{t.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
