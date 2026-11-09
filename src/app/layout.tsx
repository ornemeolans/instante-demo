import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";
import { CyanotypeDefs } from "@/components/Cyanotype";

// Bodoni Moda (didona de la época de las láminas de cianotipia) con su eje
// óptico: en tamaños grandes el trazo fino se vuelve un hilo. Hanken Grotesk
// para la interfaz: clara y discreta.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Instante · tus fotos del evento", template: "%s · Instante" },
  description: "Encontrá tus fotos del evento, elegilas y llevátelas en alta resolución.",
};

export const viewport: Viewport = {
  themeColor: "#f5f7fa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${bodoni.variable} ${hanken.variable}`}>
      <body>
        <CyanotypeDefs />
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
