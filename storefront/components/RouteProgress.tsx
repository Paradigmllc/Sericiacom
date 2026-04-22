"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Route-change indicator — two-layer, logo-free.
 *
 *   1. Aesop/LV-style 2px hairline progress bar at the top of the viewport.
 *   2. A minimal くるくる ring spinner in the top-right corner while the
 *      new route resolves.
 *
 * Per user directive 2026-04-22「この漢字ロゴは絶対✖削除して」the prior
 * 鮮 hanko mini-seal was removed and replaced with a bare ring spinner —
 * matching LuxuryLoader's stripped-down treatment.
 *
 * Triggers on pathname / searchParams change. Auto-hides after the new
 * render commits. Pure CSS transitions — no framer-motion needed.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; done?: ReturnType<typeof setTimeout> }>({});
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Reset any existing timers
    if (timers.current.tick) clearInterval(timers.current.tick);
    if (timers.current.done) clearTimeout(timers.current.done);

    setState("running");
    setProgress(10);

    timers.current.tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p;
        const step = (85 - p) * 0.08;
        return Math.min(85, p + step + 0.5);
      });
    }, 120);

    // Nominal "done" — new render committed.
    timers.current.done = setTimeout(() => {
      if (timers.current.tick) clearInterval(timers.current.tick);
      setProgress(100);
      setState("done");
      setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 250);
    }, 380);

    return () => {
      if (timers.current.tick) clearInterval(timers.current.tick);
      if (timers.current.done) clearTimeout(timers.current.done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  const visible = state !== "idle";
  const fading = state === "done";

  return (
    <>
      {/* Top hairline progress bar */}
      <div
        aria-hidden
        className="fixed left-0 right-0 top-0 z-[100] pointer-events-none"
        style={{ height: 2 }}
      >
        <div
          className="h-full bg-sericia-ink origin-left"
          style={{
            width: `${progress}%`,
            opacity: visible ? (fading ? 0 : 1) : 0,
            transition: fading
              ? "width 120ms linear, opacity 300ms ease 80ms"
              : "width 160ms ease-out, opacity 160ms ease",
          }}
        />
      </div>

      {/* くるくる ring spinner — bare, no logo */}
      <div
        aria-hidden
        className="fixed top-4 right-4 md:top-5 md:right-5 z-[99] pointer-events-none"
        style={{
          opacity: visible ? (fading ? 0 : 1) : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: fading
            ? "opacity 260ms ease 80ms, transform 260ms ease"
            : "opacity 180ms ease, transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <div
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${
            visible && !fading ? "route-kuru-loop" : ""
          }`}
          style={{
            border: "2px solid rgba(33, 35, 29, 0.14)",
            borderTopColor: "#21231d",
          }}
        />

        <style jsx>{`
          @keyframes route-kuru-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .route-kuru-loop {
            animation: route-kuru-spin 750ms linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .route-kuru-loop {
              animation: none;
            }
          }
        `}</style>
      </div>
    </>
  );
}
