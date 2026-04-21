"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * GoogleSignInButton — Supabase Auth + Google OAuth (PKCE)
 *
 * Flow:
 *   1. User clicks → `signInWithOAuth({ provider: "google" })`
 *   2. Supabase redirects browser to accounts.google.com
 *   3. Google redirects to `https://<supabase>.supabase.co/auth/v1/callback?code=...`
 *   4. Supabase sets intermediate cookie → redirects to our `/auth/callback?code=...&next=...`
 *   5. Our existing callback at `storefront/app/auth/callback/route.ts` runs
 *      `exchangeCodeForSession(code)` → session cookie set → redirect to `next`
 *   6. `auth.users` insert fires `sericia_handle_new_user()` trigger →
 *      `sericia_profiles` row auto-created from `raw_user_meta_data.full_name`
 *      (Supabase auto-populates full_name from Google's `name` claim)
 *
 * No DB code needed; no new callback route needed; profile creation is trigger-based.
 *
 * Setup required (non-code):
 *   1. Google Cloud Console → OAuth 2.0 Client ID (Web)
 *      Authorized redirect URI: https://<SUPABASE_PROJECT>.supabase.co/auth/v1/callback
 *   2. Supabase Dashboard → Auth → Providers → Google → paste Client ID + Secret
 *
 * See docs/GOOGLE_OAUTH_SETUP.md for step-by-step.
 */
export default function GoogleSignInButton({
  redirect,
  label,
  disabled,
}: {
  redirect?: string;
  label?: string;
  disabled?: boolean;
}) {
  const search = useSearchParams();
  // Precedence: explicit prop > ?redirect= query param > /account default.
  // Keeping this deterministic matters because the value is encoded into the
  // OAuth state and we want the user to end up on the same page they would
  // via email/password login.
  const effectiveRedirect = redirect || search.get("redirect") || "/account";
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const supa = supabaseBrowser();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supa.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Supabase will redirect here AFTER exchanging the Google code on
          // their side. Our /auth/callback route then exchanges the Supabase
          // session code via exchangeCodeForSession() and sets httpOnly cookies.
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(effectiveRedirect)}`,
          // Ask Google for email + basic profile. `prompt: "select_account"`
          // lets users pick between multiple Google accounts instead of silent
          // re-auth — better UX on shared devices.
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
      // signInWithOAuth does a full-page redirect — we should never reach here
      // under normal flow. If we do, something blocked the redirect.
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[google-oauth] signInWithOAuth failed", err);
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label="Sign in with Google"
      className="w-full flex items-center justify-center gap-3 border border-sericia-line hover:border-sericia-ink transition-colors bg-sericia-paper py-4 text-[14px] text-sericia-ink disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <GoogleIcon className="w-5 h-5" />
      <span>{loading ? "Redirecting…" : label || "Continue with Google"}</span>
    </button>
  );
}

/**
 * Official Google "G" logo per https://developers.google.com/identity/branding-guidelines
 * Using the SVG mark directly (not a raster) keeps it crisp at all sizes and
 * avoids loading Google's CDN (better perf + no third-party request from our
 * login page).
 */
function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
