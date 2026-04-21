"use client";
import { useState } from "react";
import Link from "next/link";

type Grade = "ceremonial" | "premium" | "culinary";

const QUESTIONS = [
  { key: "usage", label: "How will you use it?", options: [
    { val: "straight", label: "Whisk straight with water (koicha / usucha)", score: { ceremonial: 3, premium: 1, culinary: 0 } },
    { val: "latte", label: "Matcha latte / cappuccino", score: { ceremonial: 0, premium: 3, culinary: 1 } },
    { val: "baking", label: "Baking (cakes, cookies, ice cream)", score: { ceremonial: 0, premium: 0, culinary: 3 } },
    { val: "smoothie", label: "Smoothie / blended drink", score: { ceremonial: 0, premium: 1, culinary: 3 } },
  ]},
  { key: "budget", label: "Budget per 30g?", options: [
    { val: "low", label: "Under $15", score: { ceremonial: 0, premium: 1, culinary: 3 } },
    { val: "mid", label: "$15–$35", score: { ceremonial: 1, premium: 3, culinary: 1 } },
    { val: "high", label: "$35+", score: { ceremonial: 3, premium: 1, culinary: 0 } },
  ]},
  { key: "bitter", label: "Bitterness tolerance?", options: [
    { val: "sweet", label: "I want it mellow & sweet", score: { ceremonial: 3, premium: 2, culinary: 0 } },
    { val: "balanced", label: "Balanced", score: { ceremonial: 1, premium: 3, culinary: 1 } },
    { val: "strong", label: "Bold / bitter is fine", score: { ceremonial: 0, premium: 1, culinary: 3 } },
  ]},
];

const GRADE_INFO: Record<Grade, { title: string; region: string; harvest: string; usage: string; tell: string }> = {
  ceremonial: {
    title: "Ceremonial (抹茶儀式用)",
    region: "Uji (Kyoto) • Nishio (Aichi)",
    harvest: "First harvest (ichibancha), shade-grown 20+ days",
    usage: "Whisked with 70°C water for chanoyu. Never milk, never sweetened.",
    tell: "Vibrant jade green, zero grittiness, umami-forward. $35–80 per 30g.",
  },
  premium: {
    title: "Premium / Latte Grade",
    region: "Uji / Shizuoka",
    harvest: "First or early second harvest",
    usage: "Lattes, cappuccinos, sipping with light sweetening",
    tell: "Bright green, slight bitterness rounded by milk. $20–35 per 30g.",
  },
  culinary: {
    title: "Culinary / Ingredient Grade",
    region: "Later harvests, often Kagoshima",
    harvest: "Second or third harvest",
    usage: "Baking, ice cream, smoothies — where sugar/fat masks astringency",
    tell: "Olive-green, more robust/bitter. $8–20 per 30g.",
  },
};

export default function MatchaGrader() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const scores = { ceremonial: 0, premium: 0, culinary: 0 };
  for (const q of QUESTIONS) {
    const ans = answers[q.key];
    if (ans) {
      const opt = q.options.find((o) => o.val === ans);
      if (opt) {
        scores.ceremonial += opt.score.ceremonial;
        scores.premium += opt.score.premium;
        scores.culinary += opt.score.culinary;
      }
    }
  }
  const done = Object.keys(answers).length === QUESTIONS.length;
  const winner = (["ceremonial", "premium", "culinary"] as Grade[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-serif">
      <nav className="mb-8 text-sm text-sericia-ink/60">
        <Link href="/" className="hover:underline">Sericia</Link> / <Link href="/tools" className="hover:underline">Tools</Link> / Matcha Grade Decoder
      </nav>

      <h1 className="mb-4 text-4xl font-bold">Matcha Grade Decoder</h1>
      <p className="mb-10 text-lg text-sericia-ink/80">
        Ceremonial, premium, culinary — three answers and we'll tell you which matcha you actually need.
      </p>

      <div className="space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="rounded-xl border border-sericia-ink/10 bg-sericia-paper p-6">
            <div className="mb-3 font-semibold">{q.label}</div>
            <div className="space-y-2">
              {q.options.map((o) => (
                <label key={o.val} className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-3 hover:border-sericia-accent/30 hover:bg-sericia-accent/5">
                  <input type="radio" name={q.key} value={o.val}
                    checked={answers[q.key] === o.val}
                    onChange={() => setAnswers({ ...answers, [q.key]: o.val })}
                    className="accent-sericia-accent" />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="mt-10 rounded-xl bg-sericia-accent/10 p-8">
          <div className="mb-2 text-sm uppercase tracking-wider text-sericia-ink/60">Your match</div>
          <h2 className="mb-4 text-3xl font-bold text-sericia-accent">{GRADE_INFO[winner].title}</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold">Region:</dt><dd>{GRADE_INFO[winner].region}</dd></div>
            <div><dt className="font-semibold">Harvest:</dt><dd>{GRADE_INFO[winner].harvest}</dd></div>
            <div><dt className="font-semibold">Use for:</dt><dd>{GRADE_INFO[winner].usage}</dd></div>
            <div><dt className="font-semibold">What to look for:</dt><dd>{GRADE_INFO[winner].tell}</dd></div>
          </dl>
        </div>
      )}
    </main>
  );
}
