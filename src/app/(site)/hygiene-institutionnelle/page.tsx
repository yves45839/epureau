import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icon";
import { PageHeader, BandeAppel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hygiène institutionnelle",
  description:
    "Hôpitaux, buanderies, pressings, hôtels, cuisines professionnelles et restaurants : produits haute performance, équipements de dosage et expertise technique.",
};

const tuiles = [
  {
    fond: "linear-gradient(160deg,#1B2E78,#1AB5E8)",
    icone: "shirt",
    titre: "Entretien du linge",
    texte: "Lavage professionnel, détachage, désinfection, décontamination, assouplissants.",
  },
  {
    fond: "linear-gradient(160deg,#14215A,#1B2E78 60%,#2BB673)",
    icone: "building",
    titre: "Hygiène des locaux",
    texte: "Sols, sanitaires, surfaces et désinfection.",
  },
  {
    fond: "linear-gradient(160deg,#1AB5E8,#2BB673)",
    icone: "chef",
    titre: "Hygiène des cuisines et de la restauration",
    texte: "Vaisselle, surfaces, dégraissants, désinfection.",
  },
];

const etablissements = [
  "PISAM",
  "CHR d'Adzopé",
  "Hôpitaux & cliniques",
  "Hôtels & résidences",
  "Cuisines centrales",
  "Buanderies & pressings",
];

export default function Hygiene() {
  return (
    <>
      <PageHeader
        fil={["Hygiène institutionnelle"]}
        titre="Hygiène institutionnelle"
        lead="Hôpitaux, hôtels, cuisines professionnelles, buanderies et pressings : produits, dosage et expertise."
      />

      <section className="sec">
        <div className="wrap">
          <div className="split" style={{ marginBottom: "clamp(36px,4vw,56px)" }}>
            <div className="sec-head rv" style={{ margin: 0 }}>
              <h2 className="title">Notre accompagnement</h2>
              <p className="lead">
                Grâce à son partenariat avec les leaders mondiaux de l&apos;hygiène, EPUREAU optimise
                la propreté, la sécurité sanitaire et alimentaire ainsi que les coûts
                d&apos;exploitation, tout en garantissant la conformité aux normes les plus
                exigeantes.
              </p>
            </div>
            <figure className="photo illustrated-photo rv">
              <Image
                src="/images/illustrations/hygiene.webp"
                alt="Illustration générée : technicienne ouest-africaine dans une buanderie professionnelle"
                width={640}
                height={480}
                style={{ objectPosition: "70% 50%" }}
              />
              <figcaption>Entretien du linge · illustration générée</figcaption>
            </figure>
          </div>

          <div className="hyg rvs">
            {tuiles.map((t) => (
              <div className="tile" key={t.titre} style={{ ["--g" as string]: t.fond }}>
                <span className="ic">
                  <Icon name={t.icone} />
                </span>
                <h4>{t.titre}</h4>
                <p>{t.texte}</p>
              </div>
            ))}
          </div>

          <div className="clients rv">
            {etablissements.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
        </div>
      </section>

      <BandeAppel
        titre="Un plan d'hygiène à mettre en place ou à revoir ?"
        texte="Nos techniciens réalisent l'audit de vos protocoles et vous proposent les équipements de dosage adaptés."
      />
    </>
  );
}
