import {siteText, localizedMetadata} from "@/lib/site-language";
import PageSections from "@/components/PageSections";
import { pageValues } from "@/lib/cms";
import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icon";
import { PageHeader, SectionHead, BandeAppel, ChiffresCles } from "@/components/ui";
import { chiffres } from "@/content/site";

const baseMetadata: Metadata = {
  title: "À propos",
  description:
    "EPUREAU Côte d’Ivoire, SAS créée en 2015, membre de YANGONDI HOLDING : ingénierie du traitement des eaux et distribution des marques NALCO et ECOLAB.",
};





export default async function APropos() {
  const values = await pageValues("a-propos");
  const ui=await siteText();
  const t = (id: string, fallback: string) => ui(values[id] ?? fallback);

const mission = [
  {
    icone: "leaf",
    titre: t("f024", "Développer un environnement toujours plus sain et plus pratique"),
    texte:
      t("f025", "Des solutions respectueuses de l'environnement qui contribuent à la préservation du cadre de vie."),
  },
  {
    icone: "shield",
    titre: t("f026", "Protéger les installations et améliorer la productivité"),
    texte:
      t("f027", "Fiabilité des équipements, performance optimisée, efficacité et rentabilité pour nos clients."),
  },
  {
    icone: "users",
    titre: t("f028", "Fédérer les talents et nourrir une relation de confiance"),
    texte: t("f029", "Écoute, transparence et engagement durable aux côtés de nos partenaires."),
  },
];
const valeurs = [
  { titre: t("f030", "Intégrité"), texte: t("f031", "Des engagements tenus, des comptes rendus clairs et des interlocuteurs identifiés.") },
  { titre: t("f032", "Qualité"), texte: t("f033", "Le respect des normes en vigueur et des performances contractuelles.") },
  { titre: t("f034", "Innovation"), texte: t("f035", "Des procédés éprouvés — SBR, MBBR, physico-chimique — adaptés à chaque effluent.") },
  { titre: t("f036", "Responsabilité sociétale"), texte: t("f037", "La préservation de la ressource en eau et la sécurité des personnes.") },
];

  return <PageSections page="a-propos" values={values}>
<PageHeader
        fil={["À propos"]}
        titre={t("f001", "Experts en ingénierie de l'eau, au service de l'industrie ivoirienne")}
        lead={t("f002", "Une société ivoirienne, une ingénierie prouvée en potabilisation et en épuration, et le savoir-faire de deux références mondiales du traitement de l'eau et de l'hygiène.")}
      />
<section className="sec">
        <div className="wrap">
          <div className="about">
            <div className="text rv">
              <span className="eyebrow">{t("f003", "Qui sommes-nous ?")}</span>
              <h2 className="title">{t("f004", "Une SAS ivoirienne, membre du groupe YANGONDI")}</h2>
              <p className="lead" style={{ marginTop: 18 }}>{t("f005", "EPUREAU Côte d’Ivoire est une Société par Actions Simplifiée (SAS), créée et basée en Côte d'Ivoire depuis octobre 2015. Précédemment filiale du groupe MARBOUR, société française, elle a rejoint ")}<strong>{t("f006", "YANGONDI HOLDING")}</strong>{t("f007", ".")}</p>
              <p className="lead">{t("f008", "Spécialisée dans le traitement des eaux (potable, usée, industrielle), EPUREAU Côte d’Ivoire associe à son ingénierie prouvée en potabilisation et épuration des eaux le savoir-faire des marques ECOLAB et NALCO, pour assurer la performance des utilités, l'hygiène, la désinfection de vos installations et la protection de vos marques.")}</p>
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
                <Image unoptimized src={t("f009", "/images/apropos-1.jpg")} alt={t("f010", "Local technique d'une station EPUREAU Côte d’Ivoire")} width={640} height={480} />
                <figcaption>{t("f011", "STEP EUROLAIT · 270 m³/j")}</figcaption>
              </figure>
              <figure className="f2">
                <Image unoptimized src={t("f012", "/images/apropos-2.jpg")} alt={t("f013", "Unité de traitement, CHR D’ADZOPÉ")} width={640} height={360} />
                <figcaption>{t("f014", "CHR D’ADZOPÉ · 90 m³/j")}</figcaption>
              </figure>
              <figure className="f3">
                <Image unoptimized src={t("f015", "/images/apropos-3.jpg")} alt={t("f016", "Bassins de traitement, GARDEN CENTER")} width={640} height={360} />
                <figcaption>{t("f017", "GARDEN CENTER")}</figcaption>
              </figure>
              <div className="badge" aria-hidden="true">
                <div>
                  <b>{t("f018", "2015")}</b>
                  <small>{t("f019", "Côte d'Ivoire")}</small>
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
            eyebrow={t("f020", "Nos valeurs")}
            titre={t("f021", "Ce qui guide chacune de nos interventions")}
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
        titre={t("f022", "Envie d'en savoir plus sur nos méthodes ?")}
        texte={t("f023", "Présentez-nous votre site et vos contraintes : nos ingénieurs vous répondent sous 48 h ouvrées.")}
      />
</PageSections>;
}

export async function generateMetadata(){return localizedMetadata(baseMetadata);}
