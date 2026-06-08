import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rooster Films | Weddings",
  description: "Cinematografia de casamento de luxo. Capturando a poesia e a emoção do seu grande dia de forma única, sofisticada e exclusiva.",
  icons: {
    icon: "/Fotos/logotipo rooster weddings ofc.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans">{children}</body>
    </html>
  );
}

