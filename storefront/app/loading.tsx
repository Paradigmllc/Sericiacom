import PageLoading from "@/components/PageLoading";

/**
 * Root-level Suspense fallback — covers any future route group that
 * doesn't define its own `loading.tsx`. The (frontend) and (payload)
 * groups override this with their own variants, so in practice this
 * file fires only as a defensive fallback for ungrouped or new routes.
 */
export default function RootLoading() {
  return <PageLoading tone="paper" />;
}
