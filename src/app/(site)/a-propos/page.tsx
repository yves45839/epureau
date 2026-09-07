import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icon";
import { PageHeader, SectionHead, BandeAppel, ChiffresCles } from "@/components/ui";
import { chiffres } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "EPUREAU Côte d'Ivoire, SAS créée en 2015, membre de YANGONDI HOLDING : ingénierie du traitement des eaux et distribution des marques NALCO et ECOLAB.",
};

const mission = [
  {
    icone: "leaf",
    titre: "Développer un environnement toujours plus sain et plus pratique",
    texte:
      "Des solutions respectueuses de l'environnement qui contribuent à la préservation du cadre de vie.",
  },
  {
    icone: "shield",
    titre: "Protéger les installations et améliorer la productivité",
    texte:
      "Fiabilité des équipements, performance optimisée, efficacité et rentabilité pour nos clients.",
  },
  {
    icone: "users",
    titre: "Fédérer les talents et nourrir une relation de confiance",
    texte: "Écoute, transparence et engagement durable aux côtés de nos partenaires.",
  },
];

const valeurs = [
  { titre: "Intégrité", texte: "Des engagements tenus, des comptes rendus clairs et des interlocuteurs identifiés." },
  { titre: "Qualité", texte: "Le respect des normes en vigueur et des performances contractuelles." },
  { titre: "Innovation", texte: "Des procédés éprouvés — SBR, MBBR, physico-chimique — adaptés à chaque effluent." },
  { titre: "Responsabilité sociétale", texte: "La préservation de la ressource en eau et la sécurité des personnes." },
];

export default function APropos() {
  return (
    <>
      <PageHeader
        fil={["À propos"]}
        titre="Experts en ingénierie de l'eau, au service de l'industrie ivoirienne"
        lead="Une société ivoirienne, une ingénierie prouvée en potabilisation et en épuration, et le savoir-faire de deux références mondiales du traitement de l'eau et de l'hygiène."
      />

      <section className="sec">
        <div className="wrap">
          <div className="about">
            <div className="text rv">
              <span className="eyebrow">Qui sommes-nous ?</span>
              <h2 className="title">Une SAS ivoirienne, membre du groupe YANGONDI</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                EPUREAU CI est une Société par Actions Simplifiée (SAS), créée et basée en Côte
                d&apos;Ivoire depuis octobre 2015. Précédemment filiale du groupe MARBOUR, société
                française, elle a rejoint <strong>YANGONDI HOLDING</strong>.
              </p>
              <p className="lead">
                Spécialisée dans le traitement des eaux (potable, usée, industrielle), EPUREAU CÔTE
                D&apos;IVOIRE associe à son ingénierie prouvée en potabilisation et épuration des
                eaux le savoir-faire des marques ECOLAB et NALCO, pour assurer la performance des
                utilités, l&apos;hygiène, la désinfection de vos installations et la protection de
                vos marques.
              </p>
              <div className="mission">
                <ul>
                  {mission.map((m) => (
                    <li key={m.titre}>
                      <span className="ic">
                        <Icon name={m.icone} />
                      </span>
                      <div>
                        <h4>{m.titre}</h4>
                        <p>{m.texte}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="collage rv">
              <figure className="f1">
                <Image src="/images/apropos-1.jpg" alt="Local technique d'une station EPUREAU" width={640} height={480} />
                <figcaption>STEP EUROLAIT · 270 m³/j</figcaption>
              </figure>
              <figure className="f2">
                <Image src="/images/apropos-2.jpg" alt="Unité de traitement, CHR d'Adzopé" width={640} height={360} />
                <figcaption>CHR d&apos;Adzopé · 90 m³/j</figcaption>
              </figure>
              <figure className="f3">
                <Image src="/images/apropos-3.jpg" alt="Bassins de traitement, GARDEN Center" width={640} height={360} />
                <figcaption>GARDEN Center</figcaption>
              </figure>
              <div className="badge" aria-hidden="true">
                <div>
                  <b>2015</b>
                  <small>Côte d&apos;Ivoire</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChiffresCles items={chiffres} />

      <section className="sec alt">
        <div className="wrap">
          <SectionHead
            eyebrow="Nos valeurs"
            titre="Ce qui guide chacune de nos interventions"
            style={{ marginBottom: 22 }}
          />
          <div className="values rvs" style={{ marginTop: 0 }}>
            {valeurs.map((v) => (
              <div className="value" key={v.titre}>
                <strong>{v.titre}</strong>
                <p>{v.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BandeAppel
        titre="Envie d'en savoir plus sur nos méthodes ?"
        texte="Présentez-nous votre site et vos contraintes : nos ingénieurs vous répondent sous 48 h ouvrées."
      />
    </>
  );
}
