import Link from "next/link";
import type { Metadata } from "next";
import { COUNTRIES, PRODUCTS } from "@/lib/pseo-matrix";

export const metadata: Metadata = {
  title: "Japanese Craft Food Guides by Country — Sericia",
  description:
    "Country-by-country guides to buying authentic Japanese craft food: sencha, matcha, miso, shiitake, yuzu. Shipped worldwide from Japan.",
  alternates: { canonical: "https://sericia.com/guides" },
};

export default function GuidesIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 font-serif text-sericia-ink">
      <h1 className="mb-4 text-4xl font-bold">Japanese Craft Food Guides</h1>
      <p className="mb-12 text-lg text-sericia-ink/80">
        Curated guides for buying authentic Japanese craft food, shipped directly from Japan.
      </p>

      {COUNTRIES.map((c) => (
        <section key={c.code} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            {c.flag} {c.name}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.slug}
                href={`/guides/${c.code}/${p.slug}`}
                className="rounded-lg border border-sericia-ink/10 bg-sericia-paper p-4 text-sm hover:border-sericia-accent hover:bg-sericia-accent/5"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
