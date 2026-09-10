import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHeader, SectionHead, BandeAppel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Négoce de produits chimiques",
  description:
    "Produits NALCO Water, gamme ECOLAB Food & Beverage, commodités et réactifs de laboratoire : chaque besoin fait l'objet d'une cotation personnalisée.",
};

const commodites = [
  "Sel en pastilles", "Acide citrique", "Acide sulfurique", "Acide nitrique",
  "Bicarbonate de soude", "Soude caustique", "Pompes", "Analyseurs en ligne",
  "Analyseurs portatifs", "Matériel de laboratoire",
];

export default function Negoce() {
  return (
    <>
      <PageHeader
        image="/images/illustrations/industrie.webp"
        fil={["Négoce de produits chimiques"]}
        titre="Deux références mondiales, une même équipe technique locale"
        lead="Dosage, suivi analytique, audits de performance et formation de vos opérateurs. Les produits sont présentés sans tarif : chaque besoin fait l'objet d'une cotation personnalisée après échange avec nos équipes techniques."
      />

      <section className="sec">
        <div className="wrap">
          <div className="partners rvs">
            <div className="pan" id="nalco" style={{ ["--g" as string]: "linear-gradient(90deg,#1B2E78,#1AB5E8)" }}>
              <div className="brand">
                NALCO
                <small>Nalco Water · traitement des eaux industrielles</small>
              </div>
              <p>
                EPUREAU, partenaire de NALCO Water, accompagne les industries avec des solutions
                chimiques et des services techniques destinés à optimiser les performances des
                installations, réduire les coûts d&apos;exploitation et améliorer la durabilité des
                procédés.
              </p>
              <ul>
                <li>
                  <Icon name="check" />
                  Traitement des eaux industrielles : chaudières, tours de refroidissement, circuits
                  fermés, eaux de process et stations d&apos;eau potable.
                </li>
                <li>
                  <Icon name="check" />
                  Eaux usées : coagulants, floculants, antimousses, neutralisants et optimisation des
                  stations d&apos;épuration.
                </li>
              </ul>
              <Link className="btn btn-ghost btn-sm" href="/contact">
                Demander les produits NALCO <Icon name="arrow" />
              </Link>
            </div>

            <div className="pan" id="ecolab" style={{ ["--g" as string]: "linear-gradient(90deg,#1B2E78,#2BB673)" }}>
              <div className="brand">
                ECOLAB
                <small>Food &amp; Beverage · hygiène et sécurité alimentaire</small>
              </div>
              <p>
                EPUREAU, distributeur des solutions ECOLAB en Côte d&apos;Ivoire, accompagne les
                industries agroalimentaires et des boissons avec des programmes complets
                d&apos;hygiène et de nettoyage.
              </p>
              <ul>
                <li>
                  <Icon name="check" />
                  Hygiène des procédés : CIP, COP, désinfection des surfaces et des circuits.
                </li>
                <li>
                  <Icon name="check" />
                  Installations et sécurité alimentaire : lavage de bouteilles, lubrification des
                  convoyeurs.
                </li>
                <li>
                  <Icon name="check" />
                  Dosage automatique, audits d&apos;hygiène et formation des opérateurs.
                </li>
              </ul>
              <Link className="btn btn-ghost btn-sm" href="/contact">
                Demander les produits ECOLAB <Icon name="arrow" />
              </Link>
            </div>

            <div className="pan" id="commodites" style={{ ["--g" as string]: "linear-gradient(90deg,#1AB5E8,#2BB673)" }}>
              <div className="brand">
                Commodités
                <small>Matières premières, réactifs &amp; matériel</small>
              </div>
              <p>
                EPUREAU propose des réactifs de laboratoire, des matières premières et le matériel de
                mesure nécessaires à l&apos;exploitation quotidienne de vos installations.
              </p>
              <div className="chips">
                {commodites.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <div className="note">
                <Icon name="info" />
                <span>
                  Pas de prix affichés, pas de panier : chaque demande fait l&apos;objet d&apos;une
                  cotation établie par nos équipes techniques.
                </span>
              </div>
              <Link className="btn btn-ghost btn-sm" href="/contact">
                Demander une cotation <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <SectionHead
            center
            eyebrow="Marques représentées"
            titre="Un usage des marques encadré par nos partenaires"
            lead="Les noms et logos NALCO et ECOLAB sont la propriété de leurs titulaires. EPUREAU CI les présente au titre de sa qualité de distributeur en Côte d'Ivoire et dans la sous-région."
          />
        </div>
      </section>

      <BandeAppel
        titre="Besoin d'un produit précis ou d'un équivalent ?"
        texte="Indiquez-nous la référence, l'usage et les volumes : nous revenons avec une cotation et les fiches techniques."
      />
    </>
  );
}
