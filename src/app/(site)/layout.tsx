import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ToTop from "@/components/ToTop";
import { societe } from "@/content/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>
      <Nav />
      <main id="contenu">{children}</main>
      <Footer />
      <ToTop />
      <Reveal />
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
