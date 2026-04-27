import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist — Sericia",
  description: "Your saved Japanese craft from Kyoto.",
};

export const dynamic = "force-dynamic";

export default function WishlistPage() {
  return <WishlistClient />;
}
