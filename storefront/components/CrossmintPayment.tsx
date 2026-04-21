"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";
import { toast } from "sonner";

type Props = { orderId: string; amountUSD: number };

export default function CrossmintPayment({ orderId, amountUSD }: Props) {
  const router = useRouter();
  const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID ?? "";
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "payment_init_failed");
          return;
        }
        if (!data.clientSecret) {
          setError("missing_client_secret");
          return;
        }
        setClientSecret(data.clientSecret);
      } catch (e) {
        console.error("[CrossmintPayment] init failed", e);
        setError("network_error");
      }
    })();
  }, [orderId]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "crossmint:checkout:completed" || e.data?.type === "payment:process.succeeded") {
        toast.success("Payment confirmed! Redirecting…");
        router.push(`/thank-you?order=${orderId}`);
      }
      if (e.data?.type === "payment:process.rejected") {
        toast.error("Payment was rejected. Please try another method.");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [orderId, router]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-sm text-red-900">
        <p className="font-semibold mb-2">Payment couldn&apos;t be started.</p>
        <p>Reference: <code>{error}</code>. Please email <a href="mailto:contact@sericia.com" className="underline">contact@sericia.com</a> with this order ID: <code>{orderId}</code></p>
      </div>
    );
  }
  if (!clientSecret || !clientApiKey) {
    return <div className="text-center text-sericia-ink/60 py-10">Preparing secure payment…</div>;
  }

  const Checkout = CrossmintEmbeddedCheckout as unknown as React.ComponentType<Record<string, unknown>>;

  return (
    <CrossmintProvider apiKey={clientApiKey}>
      <Checkout
        clientSecret={clientSecret}
        orderId={orderId}
        payment={{
          crypto: { enabled: false },
          fiat: {
            enabled: true,
            allowedMethods: { card: true, applePay: true, googlePay: true },
          },
          defaultMethod: "fiat",
        }}
      />
      <p className="text-xs text-sericia-ink/50 text-center mt-4">
        Total: ${amountUSD} USD · Secured by Crossmint · Visa, Mastercard, AmEx, Apple Pay
      </p>
    </CrossmintProvider>
  );
}
