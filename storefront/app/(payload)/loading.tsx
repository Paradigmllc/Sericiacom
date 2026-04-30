import PageLoading from "@/components/PageLoading";

/**
 * Suspense fallback for the Payload CMS surface (`/cms/...`).
 *
 * Uses the `bare` tone because the Payload admin layout supplies its own
 * background — we just want the centered spinner so editors get the same
 * "loading is happening" idiom they'd see on the storefront, without
 * fighting the CMS chrome's colour treatment.
 */
export default function PayloadLoading() {
  return <PageLoading tone="bare" />;
}
