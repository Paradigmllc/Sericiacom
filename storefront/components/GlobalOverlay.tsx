"use client";
import dynamic from "next/dynamic";
import { useUi } from "@/lib/ui-store";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const BackToTop = dynamic(() => import("./BackToTop"), { ssr: false });
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });

export default function GlobalOverlay() {
  const cartOpen = useUi((s) => s.cartOpen);
  const setCartOpen = useUi((s) => s.setCartOpen);

  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <SearchModal />
      <BackToTop />
    </>
  );
}
