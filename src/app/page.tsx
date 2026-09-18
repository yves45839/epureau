import { pageValues, projectList, company } from "@/lib/cms";
import PreviewBanner from "@/components/PreviewBanner";
import Audience from "@/components/Audience";
import CookieBanner from "@/components/CookieBanner";
import HomeLanding from "@/components/HomeLanding";
import Footer from "@/components/Footer";
import ToTop from "@/components/ToTop";
import { societe } from "@/content/site";
import "./home.css";
import "../../public/maquette/carousels.css";

export default async function HomePage() {
  return (
    <>
      <PreviewBanner /><HomeLanding content={await pageValues("accueil")} realisations={await projectList()} societe={await company()} />
      <Footer />
      <ToTop />
      <Audience />
      <CookieBanner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
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
        }) }}
      />
    </>
  );
}
