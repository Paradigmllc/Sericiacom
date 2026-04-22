"use client";
import { useEffect, useState } from "react";

/**
 * Minimal initial-load spinner. Per user directive 2026-04-22:
 *   「ローディングアニメーションはぐるぐるのみでロゴや背景は不要」
 * and「この漢字ロゴは絶対✖削除して」
 *
 * Prior versions showed a full-screen noren curtain with the 鮮 hanko +
 * SERICIA wordmark + tagline. Removed — the loader is now just a tiny
 * ring spinner (くるくる) on a translucent backdrop, auto-dismissing
 * after ~600ms.
 *
 * - No kanji / no wordmark / no tagline / no silk threads / no noren.
 * - Respects prefers-reduced-motion (mounts → immediately unmounts).
 * - Pure CSS keyframe, no framer-motion dependency.
 */
export default function LuxuryLoader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) {
      setGone(true);
      return;
    }

    // Auto-dismiss quickly — the spinner is just a "first paint" smoother,
    // not a ceremony. 600ms is long enough to cover hydration on slow
    // connections but short enough to feel instant on fast ones.
    const t = window.setTimeout(() => setGone(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      role="presentation"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-sericia-paper/60 backdrop-blur-[1px] pointer-events-none animate-in fade-in duration-200"
    >
      <div className="kuru-ring" />
      <style jsx>{`
        @keyframes kuru-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .kuru-ring {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          border: 2px solid rgba(33, 35, 29, 0.12);
          border-top-color: #21231d;
          animation: kuru-spin 750ms linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .kuru-ring {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
