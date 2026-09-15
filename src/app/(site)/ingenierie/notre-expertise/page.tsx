import AdditionalBlocks from "@/components/AdditionalBlocks";
import { pageValues } from "@/lib/cms";
import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import Schema from "@/components/Schema";
import { PageHeader, BandeAppel } from "@/components/ui";
import { etapes } from "@/content/site";

export const metadata: Metadata = {
  title: "Notre expertise — Ingénierie du traitement de l'eau",
  description:
    "Bureau d'études, réalisation et mise en service : EPUREAU Côte d’Ivoire conçoit et livre des unités de traitement des eaux clé en main en Côte d'Ivoire.",
};



export default async function NotreExpertise() {
  const values = await pageValues("ingenierie-notre-expertise");
  const t = (id: string, fallback: string) => values[id] ?? fallback;

const services = [
  { icone: "search", titre: t("f008", "Audit et diagnostic"), texte: t("f009", "Analyse de l'effluent, mesures sur site et diagnostic des ouvrages existants.") },
  { icone: "chart", titre: t("f010", "Études et dimensionnement"), texte: t("f011", "Note de calcul, choix du procédé et dimensionnement des ouvrages.") },
  { icone: "wrench", titre: t("f012", "Travaux et installation"), texte: t("f013", "Génie civil, montage des équipements et raccordements, sous notre maîtrise.") },
  { icone: "droplet", titre: t("f014", "Mise en service"), texte: t("f015", "Tests, réglages des procédés et contrôle des performances de rejet.") },
  { icone: "boxes", titre: t("f016", "Exploitation et réactifs"), texte: t("f017", "Fourniture des produits NALCO et des réactifs de laboratoire nécessaires.") },
  { icone: "users", titre: t("f018", "Formation des équipes"), texte: t("f019", "Transfert de compétences aux exploitants du site et suivi analytique.") },
];

  return <> (
    <>
      <PageHeader
        image="/images/illustrations/ingenierie.webp"
        fil={["Ingénierie de l'eau", "Notre expertise"]}
        titre={t("f001", "De la conception à l'exploitation, EPUREAU Côte d’Ivoire assure toute la chaîne")}
        lead={t("f002", "Nous nous engageons sur les performances, les coûts et le respect des délais grâce à des méthodes d'installation adaptées, jusqu'à la livraison clé en main des unités de traitement.")}
      />

      <section className="sec">
        <div className="wrap">
          <div className="process">
            <div className="steps">
              <span className="line" />
              {etapes.map((e, i) => (
                <article className={`step${i === 0 ? " on" : ""}`} key={e.titre} data-stage={i + 1}>
                  <span className="k">{e.cle}</span>
                  <h3>{e.titre}</h3>
                  <p>{e.texte}</p>
                  <ul>
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <Schema />
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow">{t("f003", "Services complémentaires")}</span>
            <h2 className="title">{t("f004", "Ce que nous prenons en charge")}</h2>
          </div>
          <div className="services rvs">
            {services.map((s) => (
              <div className="svc" key={s.titre}>
                <span className="ic">
                  <Icon name={s.icone} />
                </span>
                <div>
                  <b>{s.titre}</b>
                  <p>{s.texte}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 34 }}>
            <Link className="btn btn-ghost" href="/ingenierie/nos-realisations">{t("f005", "Voir nos réalisations ")}<Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <BandeAppel
        titre={t("f006", "Une station à concevoir, à réhabiliter ou à mettre aux normes ?")}
        texte={t("f007", "Transmettez-nous la nature de l'effluent, le débit et vos contraintes de site : nous revenons avec une proposition chiffrée.")}
      />
    </>
  ) <AdditionalBlocks page="ingenierie-notre-expertise" /></>;
}
