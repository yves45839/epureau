import HomeLanding from "@/components/HomeLanding";
import Footer from "@/components/Footer";
import ToTop from "@/components/ToTop";
import { societe } from "@/content/site";
import "./home.css";

export default function HomePage() {
  return (
    <>
      <HomeLanding />
      <Footer />
      <ToTop />
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
