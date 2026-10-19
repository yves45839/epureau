import {PublicLanguage} from "@/components/UiText";
import {siteLanguage,localizedMetadata} from "@/lib/site-language";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./editorial.css";
import "./customer.css";
import "./cms-public.css";
import "./typography.css";

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

export async function generateMetadata(): Promise<Metadata> {
 return localizedMetadata({metadataBase:new URL("https://epureau-ci.com"),title:{default:"EPUREAU Côte d’Ivoire",template:"%s | EPUREAU Côte d’Ivoire"},robots:{index:true,follow:true}});
}

export const viewport: Viewport = {
  themeColor: "#1B2E78",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={await siteLanguage()} className={`js ${outfit.variable} ${inter.variable} ${mono.variable}`}>
      <body><PublicLanguage language={await siteLanguage()}>{children}</PublicLanguage></body>
    </html>
  );
}
