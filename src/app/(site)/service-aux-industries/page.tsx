import AdditionalBlocks from "@/components/AdditionalBlocks";
import { pageValues } from "@/lib/cms";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHeader, BandeAppel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Service aux industries",
  description:
    "Application de produits formulés, optimisation des utilités et services spéciaux ECOLAB Food & Beverage : lavage de bouteilles, lubrification des lignes, CIP et COP.",
};





export default async function Industries() {
  const values = await pageValues("service-aux-industries");
  const t = (id: string, fallback: string) => values[id] ?? fallback;

const secteurs = [
  "Agroalimentaire et boissons",
  "Industries de transformation et usines de production",
  "Sucrerie, huilerie, cacao et filières agricoles",
  "Traitement et réutilisation des eaux industrielles",
];
const speciaux = [
  {
    titre: t("f011", "Lavage de bouteilles"),
    texte: t("f012", "Programmes de lavage optimisés pour les lignes de conditionnement verre et PET."),
    image: t("f013", "/images/dom-industries.jpg"),
    alt: t("f014", "Ligne de lavage de bouteilles"),
  },
  {
    titre: t("f015", "Lubrification des lignes"),
    texte:
      t("f016", "Réduction des frottements et de la casse, pour une cadence stable et une consommation d'eau maîtrisée."),
    image: t("f017", "/images/gal-3.jpg"),
    alt: t("f018", "Convoyeur de bouteilles en production"),
  },
  {
    titre: t("f019", "Systèmes CIP et COP"),
    texte: t("f020", "Nettoyage en place et hors place des cuves, échangeurs et circuits de fabrication."),
    image: t("f021", "/images/dom-negoce.jpg"),
    alt: t("f022", "Cuves et circuits de fabrication"),
  },
];

  return <> (
    <>
      <PageHeader
        image="/images/illustrations/industrie.webp"
        fil={["Service aux industries"]}
        titre={t("f001", "Une équipe technique chevronnée au service de votre production")}
        lead={t("f002", "EPUREAU Côte d’Ivoire est une société de service : nous prenons en charge les optimisations dans nos spécialités pendant que vous vous concentrez sur votre production.")}
      />

      <section className="sec">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow">{t("f003", "Application de produits formulés")}</span>
            <h2 className="title">{t("f004", "Distributeur des marques ECOLAB et NALCO")}</h2>
            <p className="lead">{t("f005", "Nous vous accompagnons dans le bon dosage et les bonnes pratiques afin de réduire vos coûts de production et d'assurer l'hygiène de vos installations et de vos produits.")}</p>
          </div>

          <div className="chips rv">
            {secteurs.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <Link className="btn btn-primary" href="/contact">{t("f006", "Demander une cotation ")}<Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow vert">{t("f007", "ECOLAB Food & Beverage · services spéciaux")}</span>
            <h2 className="title">{t("f008", "Trois programmes au cœur de vos lignes")}</h2>
          </div>
          <div className="f3 rvs">
            {speciaux.map((p) => (
              <div className="pcard" key={p.titre}>
                <div className="im">
                  <Image unoptimized src={p.image} alt={p.alt} width={640} height={400} />
                </div>
                <div className="bd">
                  <h4>{p.titre}</h4>
                  <p>{p.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BandeAppel
        titre={t("f009", "Un poste de consommation à optimiser sur votre site ?")}
        texte={t("f010", "Audit de vos utilités, plan de dosage et suivi analytique : parlons-en.")}
      />
    </>
  ) <AdditionalBlocks page="service-aux-industries" /></>;
}
