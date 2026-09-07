import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import Schema from "@/components/Schema";
import { PageHeader, BandeAppel } from "@/components/ui";
import { etapes } from "@/content/site";

export const metadata: Metadata = {
  title: "Notre expertise — Ingénierie du traitement de l'eau",
  description:
    "Bureau d'études, réalisation et mise en service : EPUREAU CI conçoit et livre des unités de traitement des eaux clé en main en Côte d'Ivoire.",
};

const services = [
  { icone: "search", titre: "Audit et diagnostic", texte: "Analyse de l'effluent, mesures sur site et diagnostic des ouvrages existants." },
  { icone: "chart", titre: "Études et dimensionnement", texte: "Note de calcul, choix du procédé et dimensionnement des ouvrages." },
  { icone: "wrench", titre: "Travaux et installation", texte: "Génie civil, montage des équipements et raccordements, sous notre maîtrise." },
  { icone: "droplet", titre: "Mise en service", texte: "Tests, réglages des procédés et contrôle des performances de rejet." },
  { icone: "boxes", titre: "Exploitation et réactifs", texte: "Fourniture des produits NALCO et des réactifs de laboratoire nécessaires." },
  { icone: "users", titre: "Formation des équipes", texte: "Transfert de compétences aux exploitants du site et suivi analytique." },
];

export default function NotreExpertise() {
  return (
    <>
      <PageHeader
        fil={["Ingénierie de l'eau", "Notre expertise"]}
        titre="De la conception à l'exploitation, EPUREAU CI assure toute la chaîne"
        lead="Nous nous engageons sur les performances, les coûts et le respect des délais grâce à des méthodes d'installation adaptées, jusqu'à la livraison clé en main des unités de traitement."
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
            <span className="eyebrow">Services complémentaires</span>
            <h2 className="title">Ce que nous prenons en charge</h2>
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
            <Link className="btn btn-ghost" href="/ingenierie/nos-realisations">
              Voir nos réalisations <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <BandeAppel
        titre="Une station à concevoir, à réhabiliter ou à mettre aux normes ?"
        texte="Transmettez-nous la nature de l'effluent, le débit et vos contraintes de site : nous revenons avec une proposition chiffrée."
      />
    </>
  );
}
