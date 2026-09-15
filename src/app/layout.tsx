import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./editorial.css";
import "./customer.css";
import "./cms-public.css";

// Polices auto-hébergées (fichiers dans src/fonts) : pas d'appel à Google Fonts,
// donc pas de requête externe côté visiteur ni de dépendance au réseau au build.
const outfit = localFont({
  src: [
    { path: "../fonts/outfit-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/outfit-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/outfit-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/outfit-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/outfit-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--ff-outfit",
  display: "swap",
});
const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--ff-inter",
  display: "swap",
});
const mono = localFont({
  src: [{ path: "../fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.epureau-ci.com"),
  title: {
    default: "EPUREAU Côte d’Ivoire — Ingénierie du traitement de l'eau",
    template: "%s — EPUREAU Côte d’Ivoire",
  },
  description:
    "Conception et réalisation de stations de traitement des eaux, service aux industries, hygiène institutionnelle et négoce des produits NALCO et ECOLAB en Côte d'Ivoire.",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    siteName: "EPUREAU Côte d’Ivoire",
    title: "EPUREAU Côte d’Ivoire — Ingénierie du traitement de l'eau",
    description:
      "Des solutions fiables pour votre satisfaction : stations de traitement des eaux, services aux industries, hygiène institutionnelle.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1B2E78",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`js ${outfit.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
