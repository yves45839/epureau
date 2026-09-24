import {siteLanguage} from "@/lib/site-language";
import PageSections from "@/components/PageSections";
import { pageValues, productList } from "@/lib/cms";
import ProductCatalog from "@/components/ProductCatalog";
import {publicProduct} from "@/content/product-catalog";
import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHeader, SectionHead, BandeAppel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Négoce de produits chimiques",
  description:
    "Produits NALCO WATER, gamme ECOLAB Food & Beverage, commodités et réactifs de laboratoire : chaque besoin fait l'objet d'une cotation personnalisée.",
};



export default async function Negoce() {
  const values = await pageValues("negoce");
  const produits = await productList();
  const prefix="/"+await siteLanguage();
  const t = (id: string, fallback: string) => values[id] ?? fallback;

const commodites = [
  "Sel en pastilles", "Acide citrique", "Acide sulfurique", "Acide nitrique",
  "Bicarbonate de soude", "Soude caustique", "Pompes", "Analyseurs en ligne",
  "Analyseurs portatifs", "Matériel de laboratoire",
];

  return <PageSections page="negoce" values={values}>
<PageHeader
        fil={["Négoce de produits chimiques"]}
        titre={t("f001", "Deux références mondiales, une même équipe technique locale")}
        lead={t("f002", "Dosage, suivi analytique, audits de performance et formation de vos opérateurs. Les produits sont présentés sans tarif : chaque besoin fait l'objet d'une cotation personnalisée après échange avec nos équipes techniques.")}
      />
<section className="sec">
        <div className="wrap">
          <ProductCatalog products={produits.map(publicProduct)} prefix={prefix} />
          <div className="partners rvs">
            <div className="pan" id="nalco" style={{ ["--g" as string]: "linear-gradient(90deg,#1B2E78,#1AB5E8)" }}>
              <div className="brand">{t("f003", "NALCO")}<small>{t("f004", "Nalco Water · traitement des eaux industrielles")}</small>
              </div>
              <p>{t("f005", "EPUREAU Côte d’Ivoire, partenaire de NALCO WATER, accompagne les industries avec des solutions chimiques et des services techniques destinés à optimiser les performances des installations, réduire les coûts d'exploitation et améliorer la durabilité des procédés.")}</p>
              <ul>
                <li>
                  <Icon name="check" />{t("f006", "Traitement des eaux industrielles : chaudières, tours de refroidissement, circuits fermés, eaux de process et stations d'eau potable.")}</li>
                <li>
                  <Icon name="check" />{t("f007", "Eaux usées : coagulants, floculants, antimousses, neutralisants et optimisation des stations d'épuration.")}</li>
              </ul>
              <Link className="btn btn-ghost btn-sm" href="/contact">{t("f008", "Demander les produits NALCO ")}<Icon name="arrow" />
              </Link>
            </div>

            <div className="pan" id="ecolab" style={{ ["--g" as string]: "linear-gradient(90deg,#1B2E78,#2BB673)" }}>
              <div className="brand">{t("f009", "ECOLAB")}<small>{t("f010", "Food & Beverage · hygiène et sécurité alimentaire")}</small>
              </div>
              <p>{t("f011", "EPUREAU Côte d’Ivoire, distributeur des solutions ECOLAB en Côte d'Ivoire, accompagne les industries agroalimentaires et des boissons avec des programmes complets d'hygiène et de nettoyage.")}</p>
              <ul>
                <li>
                  <Icon name="check" />{t("f012", "Hygiène des procédés : CIP, COP, désinfection des surfaces et des circuits.")}</li>
                <li>
                  <Icon name="check" />{t("f013", "Installations et sécurité alimentaire : lavage de bouteilles, lubrification des convoyeurs.")}</li>
                <li>
                  <Icon name="check" />{t("f014", "Dosage automatique, audits d'hygiène et formation des opérateurs.")}</li>
              </ul>
              <Link className="btn btn-ghost btn-sm" href="/contact">{t("f015", "Demander les produits ECOLAB ")}<Icon name="arrow" />
              </Link>
            </div>

            <div className="pan" id="commodites" style={{ ["--g" as string]: "linear-gradient(90deg,#1AB5E8,#2BB673)" }}>
              <div className="brand">{t("f016", "Commodités")}<small>{t("f017", "Matières premières, réactifs & matériel")}</small>
              </div>
              <p>{t("f018", "EPUREAU Côte d’Ivoire propose des réactifs de laboratoire, des matières premières et le matériel de mesure nécessaires à l'exploitation quotidienne de vos installations.")}</p>
              <div className="chips">
                {commodites.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <div className="note">
                <Icon name="info" />
                <span>{t("f019", "Pas de prix affichés, pas de panier : chaque demande fait l'objet d'une cotation établie par nos équipes techniques.")}</span>
              </div>
              <Link className="btn btn-ghost btn-sm" href="/contact">{t("f020", "Demander une cotation ")}<Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>
<section className="sec alt">
        <div className="wrap">
          <SectionHead
            center
            eyebrow={t("f021", "Marques représentées")}
            titre={t("f022", "Un usage des marques encadré par nos partenaires")}
            lead={t("f023", "Les noms et logos NALCO et ECOLAB sont la propriété de leurs titulaires. EPUREAU Côte d’Ivoire les présente au titre de sa qualité de distributeur en Côte d'Ivoire et dans la sous-région.")}
          />
        </div>
      </section>
<BandeAppel
        titre={t("f024", "Besoin d'un produit précis ou d'un équivalent ?")}
        texte={t("f025", "Indiquez-nous la référence, l'usage et les volumes : nous revenons avec une cotation et les fiches techniques.")}
      />
</PageSections>;
}
