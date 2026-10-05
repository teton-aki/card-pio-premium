import type { Metadata, Viewport } from "next";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sua Lanchonete Aqui | Cardápio online",
    template: "%s | Sua Lanchonete Aqui",
  },
  description:
    "Lanches caprichados, pizzas do seu jeito e combos para compartilhar. Monte seu pedido e finalize pelo WhatsApp. Cardápio demonstrativo em Lages, SC.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
