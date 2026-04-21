import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sericia — Rescued Japanese Craft Food",
  description:
    "Drop-by-drop releases of surplus Japanese craft food: sencha, miso, dried shiitake. Rescued from disposal. Shipped worldwide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
