"use client";
import { CrossmintPayButton, CrossmintProvider } from "@crossmint/client-sdk-react-ui";
import { toast } from "sonner";

type Props = { dropId: string; amountUSD: number; title: string };

export default function CrossmintButton({ dropId, amountUSD, title }: Props) {
  const clientId = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID;
  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => toast.error("Crossmint client ID not configured yet")}
        className="w-full bg-sericia-ink text-sericia-paper py-4 rounded-lg font-medium hover:opacity-90 transition"
      >
        Buy now — ${amountUSD}
      </button>
    );
  }

  return (
    <CrossmintProvider apiKey={clientId}>
      <CrossmintPayButton
        clientId={clientId}
        environment="staging"
        mintConfig={{
          type: "erc-721",
          totalPrice: amountUSD.toString(),
          quantity: "1",
        }}
        mintTo=""
        checkoutProps={{
          experimental: { useCardWalletExperience: true },
          paymentMethods: ["fiat"],
        }}
        getButtonText={(connecting, paymentMethod) =>
          connecting ? "Processing…" : `Buy now — $${amountUSD}`
        }
        onClick={(e) => {
          e.preventDefault();
          toast.message(`Starting checkout: ${title}`);
        }}
      />
    </CrossmintProvider>
  );
}
