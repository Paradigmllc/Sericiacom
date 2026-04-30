import PageLoading from "@/components/PageLoading";

/**
 * Route-level Suspense fallback for every (frontend) route.
 *
 * Next.js App Router automatically wraps child routes in a Suspense
 * boundary using this component as the fallback. It mounts the moment
 * navigation starts and persists until the new route's RSC payload +
 * any awaited data fetches resolve. This is what makes the
 * "click → instant くるくる feedback → page swap" UX work even when
 * the destination is doing slow server-side data fetching.
 *
 * Per-segment refinements (e.g. PDP-shaped skeleton at
 * `products/[slug]/loading.tsx`) can override this baseline. Until then,
 * every nested route inherits the same shared spinner via
 * `<PageLoading />` — guaranteeing identical visual treatment across the
 * entire frontend per user directive 2026-04-30
 * 「全ページローディングアニメーション、全ページ共通デザイン」.
 */
export default function FrontendLoading() {
  return <PageLoading tone="paper" />;
}
