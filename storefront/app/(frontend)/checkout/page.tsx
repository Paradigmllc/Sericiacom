import type { Metadata } from "next";
import CartCheckoutForm from "@/components/CartCheckoutForm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, Eyebrow } from "@/components/ui";
export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function CheckoutPage() {
  return <><SiteHeader /><Container size="wide" className="py-12 sm:py-16 md:py-20 lg:py-24">
    <Eyebrow>Checkout</Eyebrow><h1 className="mb-10 text-3xl sm:text-4xl md:text-5xl">Your order, confirmed step by step.</h1>
    <CartCheckoutForm />
  </Container><SiteFooter /></>;
}
