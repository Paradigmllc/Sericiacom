"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * CookieConsent — Aesop-style bottom-fixed banner.
 *
 * Design principles (matches sericia.com brand grammar exactly):
 *   • Paper background + ink type, not a cheap dark-modal intrusion
 *   • Hairline border, no drop shadow, no rounded corners
 *   • Editorial copy in brand voice — "We store a minimum" not
 *     "We use cookies to enhance your experience ✨"
 *   • Two primary actions only: Accept / Decline. A third "Learn more"
 *     links to the privacy policy rather than an in-banner modal
 *     (simpler = more luxurious).
 *
 * Storage contract:
 *   localStorage["sericia:cookie-consent"] = JSON.stringify({
 *     decision: "accept" | "decline",
 *     decidedAt: ISO-8601 timestamp
 *   })
 *
 * Re-ask cadence: 365 days. Storing the decision timestamp (rather than a
 * boolean) lets us silently re-prompt after a year without burning the
 * visitor every session — matches GDPR / ePrivacy expectations.
 *
 * A11y:
 *   role="dialog" + aria-labelledby so screen readers announce it;
 *   focusable Decline action as the default focus target (quieter UX).
 */

type Decision = "accept" | "decline";
type Stored = { decision: Decision; decidedAt: string };

const STORAGE_KEY = "sericia:cookie-consent";
const REASK_AFTER_DAYS = 365;

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.decision && parsed?.decidedAt) return parsed;
    return null;
  } catch {
    return null;
  }
}

function isStillValid(stored: Stored): boolean {
  const decidedAt = new Date(stored.decidedAt).getTime();
  if (Number.isNaN(decidedAt)) return false;
  const ageMs = Date.now() - decidedAt;
  const maxAgeMs = REASK_AFTER_DAYS * 24 * 60 * 60 * 1000;
  return ageMs < maxAgeMs;
}

function writeDecision(decision: Decision) {
  if (typeof window === "undefined") return;
  try {
    const payload: Stored = {
      decision,
      decidedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Fire a window event so any analytics component can adjust in real time
    window.dispatchEvent(
      new CustomEvent("sericia:consent-changed", { detail: payload })
    );
  } catch (e) {
    // localStorage can throw in privacy modes; non-fatal
    console.error("[CookieConsent] failed to persist decision:", e);
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  // Initial visibility check after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const stored = readStored();
    if (!stored || !isStillValid(stored)) {
      // Slight delay so the banner doesn't slam in during route transition
      const t = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const handle = (decision: Decision) => {
    writeDecision(decision);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-body"
      className="fixed inset-x-0 bottom-0 z-[95] border-t border-sericia-line bg-sericia-paper animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 md:py-6 flex flex-col md:flex-row md:items-start gap-5 md:gap-10">
        <div className="flex-1 min-w-0">
          <p
            id="cookie-consent-title"
            className="label mb-2"
          >
            A quiet note
          </p>
          <p
            id="cookie-consent-body"
            className="text-[14px] md:text-[15px] leading-relaxed text-sericia-ink-soft max-w-3xl"
          >
            Sericia stores a small number of cookies — the essentials to keep
            your cart, your sign-in, and your region. Optional analytics help
            us understand which drops readers actually open. You can decline
            the optional ones at any time. Our{" "}
            <Link href="/privacy" className="underline-link">
              privacy policy
            </Link>{" "}
            has the detail.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handle("decline")}
            className="inline-flex items-center justify-center px-6 py-3 text-[12px] tracking-[0.2em] uppercase border border-sericia-line text-sericia-ink-soft hover:border-sericia-ink hover:text-sericia-ink transition-colors"
          >
            Decline optional
          </button>
          <button
            type="button"
            onClick={() => handle("accept")}
            autoFocus
            className="inline-flex items-center justify-center px-6 py-3 text-[12px] tracking-[0.2em] uppercase bg-sericia-ink text-sericia-paper hover:bg-sericia-accent transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
