export type PaymentProviderMode =
  | "stripe_only"
  | "hyperswitch_legacy";

/**
 * Resolve which providers should render at checkout.
 *
 * Server-only call: reads non-public env vars (NEXT_PUBLIC_* still works
 * server-side; we use them for symmetry with the build-time inlined
 * client values). Client components receive the resolved mode via props
 * from server components — never call this from a "use client" file.
 */
export function getActiveProviders(): {
  mode: PaymentProviderMode;
  stripeEnabled: boolean;
  hyperswitchEnabled: boolean;
  crossmintEnabled: boolean;
} {
  const crossmintEnabled = false;
  const hyperswitchEnabled =
    (process.env.NEXT_PUBLIC_HYPERSWITCH_ENABLED ?? "").toLowerCase() === "true";
  // Stripe is the default ON rail. Operator can force-disable in an
  // emergency by setting NEXT_PUBLIC_STRIPE_ENABLED=false.
  const stripeEnabled =
    (process.env.NEXT_PUBLIC_STRIPE_ENABLED ?? "true").toLowerCase() !== "false";

  // Hyperswitch legacy path takes precedence only if Stripe is disabled
  // AND Hyperswitch is explicitly enabled (operator self-hosted scenario).
  if (!stripeEnabled && hyperswitchEnabled) {
    return {
      mode: "hyperswitch_legacy",
      stripeEnabled: false,
      hyperswitchEnabled: true,
      crossmintEnabled,
    };
  }

  return {
    mode: "stripe_only",
    stripeEnabled: true,
    hyperswitchEnabled,
    crossmintEnabled,
  };
}
