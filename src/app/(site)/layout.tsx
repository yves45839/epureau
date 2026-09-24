import UiText from "@/components/UiText";
import LanguageSwitch from "@/components/LanguageSwitch";
import PreviewBanner from "@/components/PreviewBanner";
import Audience from "@/components/Audience";
import CookieBanner from "@/components/CookieBanner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ToTop from "@/components/ToTop";
import { societe } from "@/content/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#contenu">
        <UiText text="Aller au contenu" />
      </a>
      <LanguageSwitch /><PreviewBanner /><Nav />
      <main id="contenu">{children}</main>
      <Footer />
      <ToTop />
      <Reveal />
      <Audience />
      <CookieBanner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: societe.nom,
            url: "https://www.epureau-ci.com",
            email: societe.email,
            telephone: societe.telephone,
            address: {
              "@type": "PostalAddress",
              streetAddress: "424 Rue Koffi N'Guessan, Cité des Cadres",
              addressLocality: "Abidjan",
              addressCountry: "CI",
            },
          }),
        }}
      />
    </>
  );
}
