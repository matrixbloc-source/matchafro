import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatchAfro — Réservez les meilleurs experts beauté afro",
  description:
    "Tresses, locks, perruques, barber, maquillage et onglerie. Trouvez et réservez les meilleurs professionnels de la beauté afro près de chez vous.",
  openGraph: {
    title: "MatchAfro — Réservez les meilleurs experts beauté afro",
    description:
      "Tresses, locks, perruques, barber, maquillage et onglerie près de chez vous.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
