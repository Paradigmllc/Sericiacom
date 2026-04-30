/**
 * Shared page-level loading state — single source of truth for the
 * route-level Suspense fallback used across the entire app.
 *
 * Why a shared component instead of inlining the SVG in each `loading.tsx`?
 *   The user requirement (2026-04-30) is that every page across the app
 *   shows the SAME loading animation when navigating. Centralising the
 *   spinner here means changing the design once propagates to every
 *   route-segment loader (frontend, CMS, root fallback). It also matches
 *   the visual vocabulary of LuxuryLoader (first-paint corner spinner)
 *   and RouteProgress (top hairline + corner spinner) so a visitor sees
 *   one consistent "kura craft" loading idiom regardless of which surface
 *   they're on.
 *
 * Tone notes (Aesop / Le Labo / LV reference):
 *   - Centered SVG ring with 90% arc, rotates at 900ms cubic-bezier.
 *   - Paper-tinted full-bleed canvas occupying the content area only —
 *     the page chrome (header, footer, announcement bar) supplied by the
 *     parent layout stays mounted, so the visitor never sees a blank page.
 *   - prefers-reduced-motion → spinner stops animating, paper canvas
 *     remains as a static placeholder so the loading state is still
 *     legible without motion.
 *   - No skeletons, no shimmer — luxury brands prefer silence over
 *     animated content placeholders. The single ring spinner is enough
 *     to communicate "we are working" without competing with the brand's
 *     typographic discipline.
 *
 * Variants:
 *   - `tone="paper"` (default) — sericia-paper background, ink stroke.
 *     Matches the user-facing storefront chrome.
 *   - `tone="bare"` — transparent background, ink stroke. Used when the
 *     parent layout already paints a background (e.g. CMS admin).
 */
type Tone = "paper" | "bare";

export default function PageLoading({ tone = "paper" }: { tone?: Tone }) {
  const bg = tone === "paper" ? "bg-sericia-paper" : "bg-transparent";
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`flex min-h-[60vh] w-full items-center justify-center ${bg}`}
    >
      <span className="sr-only">Loading…</span>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="page-loading-kuru md:h-8 md:w-8"
        aria-hidden
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          stroke="rgba(33, 35, 29, 0.10)"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="14"
          cy="14"
          r="11"
          stroke="#21231d"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="62 69.12"
          fill="none"
          transform="rotate(-90 14 14)"
        />
      </svg>
      <style>{`
        @keyframes page-loading-kuru-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .page-loading-kuru {
          animation: page-loading-kuru-spin 900ms cubic-bezier(0.65, 0, 0.35, 1) infinite;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-loading-kuru { animation: none; }
        }
      `}</style>
    </div>
  );
}
