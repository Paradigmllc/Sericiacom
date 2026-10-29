"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function StorefrontError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[storefront] Page could not load", error);
    toast.error("This page is temporarily unavailable. Please try again.");
  }, [error]);
  return (
    <section role="alert" className="mx-auto max-w-xl px-6 py-16 sm:py-20 md:py-24 lg:py-28">
      <h1 className="text-2xl">This page is temporarily unavailable</h1>
      <p className="mt-4">We couldn’t load the latest information. Please try again shortly.</p>
      <button type="button" aria-label="Retry loading page" onClick={reset}
        className="mt-6 border border-current px-6 py-3 focus-visible:outline focus-visible:outline-2">
        Try again
      </button>
    </section>
  );
}
