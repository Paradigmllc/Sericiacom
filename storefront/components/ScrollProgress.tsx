"use client";
import { useEffect, useState } from "react";

/**
 * Scroll-position indicator — complements RouteProgress.
 *
 * RouteProgress fires on pathname/searchParams change (route transitions).
 * ScrollProgress fires on window scroll (reading position). The two coexist
 * as a two-layer progress system and do not conflict:
 *
 *   - RouteProgress: bg-sericia-ink (near-black), 2px, z-[100], auto-hides
 *   - ScrollProgress: bg-sericia-heart (crimson #BF3649), 2px, z-[99],
 *     visible while there is scrollable content and the viewport is not at
 *     the very top. Hidden on pages that fit in a single viewport (no
 *     scrollable content → bar would be meaningless at 100%).
 *
 * Uses requestAnimationFrame to throttle updates. Respects
 * prefers-reduced-motion by snapping without a CSS transition when set.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const compute = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      // Pages that fit in one viewport have docHeight <= 0. Hiding the bar
      // keeps short pages (/thank-you, /login) clean.
      if (docHeight <= 4) {
        setHasScroll(false);
        setProgress(0);
        return;
      }
      setHasScroll(true);
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        compute();
      });
    };

    // Initial compute after mount so the bar reflects an anchor-scrolled URL
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[99] pointer-events-none"
      style={{ height: 2 }}
    >
      <div
        className="h-full bg-sericia-heart origin-left"
        style={{
          width: `${progress}%`,
          opacity: hasScroll && progress > 0.5 ? 1 : 0,
          transition:
            "width 80ms linear, opacity 200ms ease",
        }}
      />
    </div>
  );
}
