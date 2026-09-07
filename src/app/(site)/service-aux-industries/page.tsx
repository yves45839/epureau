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

const secteurs = [
  "Agroalimentaire et boissons",
  "Industries de transformation et usines de production",
  "Sucrerie, huilerie, cacao et filières agricoles",
  "Traitement et réutilisation des eaux industrielles",
];

const speciaux = [
  {
    titre: "Lavage de bouteilles",
    texte: "Programmes de lavage optimisés pour les lignes de conditionnement verre et PET.",
    image: "/images/dom-industries.jpg",
    alt: "Ligne de lavage de bouteilles",
  },
  {
    titre: "Lubrification des lignes",
    texte:
      "Réduction des frottements et de la casse, pour une cadence stable et une consommation d'eau maîtrisée.",
    image: "/images/gal-3.jpg",
    alt: "Convoyeur de bouteilles en production",
  },
  {
    titre: "Systèmes CIP et COP",
    texte: "Nettoyage en place et hors place des cuves, échangeurs et circuits de fabrication.",
    image: "/images/dom-negoce.jpg",
    alt: "Cuves et circuits de fabrication",
  },
];

export default function Industries() {
  return (
    <>
      <PageHeader
        fil={["Service aux industries"]}
        titre="Une équipe technique chevronnée au service de votre production"
        lead="EPUREAU CI est une société de service : nous prenons en charge les optimisations dans nos spécialités pendant que vous vous concentrez sur votre production."
      />

      <section className="sec">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow">Application de produits formulés</span>
            <h2 className="title">Distributeur des marques ECOLAB et NALCO</h2>
            <p className="lead">
              Nous vous accompagnons dans le bon dosage et les bonnes pratiques afin de réduire vos
              coûts de production et d&apos;assurer l&apos;hygiène de vos installations et de vos
              produits.
            </p>
          </div>

          <div className="chips rv">
            {secteurs.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <Link className="btn btn-primary" href="/contact">
              Demander une cotation <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow vert">ECOLAB Food &amp; Beverage · services spéciaux</span>
            <h2 className="title">Trois programmes au cœur de vos lignes</h2>
          </div>
          <div className="f3 rvs">
            {speciaux.map((p) => (
              <div className="pcard" key={p.titre}>
                <div className="im">
                  <Image src={p.image} alt={p.alt} width={640} height={400} />
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
        titre="Un poste de consommation à optimiser sur votre site ?"
        texte="Audit de vos utilités, plan de dosage et suivi analytique : parlons-en."
      />
    </>
  );
}
