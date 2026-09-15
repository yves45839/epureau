import AdditionalBlocks from "@/components/AdditionalBlocks";
import { pageValues } from "@/lib/cms";
import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icon";
import { PageHeader, BandeAppel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hygiène institutionnelle",
  description:
    "Hôpitaux, buanderies, pressings, hôtels, cuisines professionnelles et restaurants : produits haute performance, équipements de dosage et expertise technique.",
};





export default async function Hygiene() {
  const values = await pageValues("hygiene-institutionnelle");
  const t = (id: string, fallback: string) => values[id] ?? fallback;

const tuiles = [
  {
    fond: "linear-gradient(160deg,#1B2E78,#1AB5E8)",
    icone: "shirt",
    titre: t("f010", "Entretien du linge"),
    texte: t("f011", "Lavage professionnel, détachage, désinfection, décontamination, assouplissants."),
  },
  {
    fond: "linear-gradient(160deg,#14215A,#1B2E78 60%,#2BB673)",
    icone: "building",
    titre: t("f012", "Hygiène des locaux"),
    texte: t("f013", "Sols, sanitaires, surfaces et désinfection."),
  },
  {
    fond: "linear-gradient(160deg,#1AB5E8,#2BB673)",
    icone: "chef",
    titre: t("f014", "Hygiène des cuisines et de la restauration"),
    texte: t("f015", "Vaisselle, surfaces, dégraissants, désinfection."),
  },
];
const etablissements = [
  "PISAM",
  "CHR D’ADZOPÉ",
  "Hôpitaux & cliniques",
  "Hôtels & résidences",
  "Cuisines centrales",
  "Buanderies & pressings",
];

  return <> (
    <>
      <PageHeader
        fil={["Hygiène institutionnelle"]}
        titre={t("f001", "Hygiène institutionnelle")}
        lead={t("f002", "Hôpitaux, hôtels, cuisines professionnelles, buanderies et pressings : produits, dosage et expertise.")}
      />

      <section className="sec">
        <div className="wrap">
          <div className="split" style={{ marginBottom: "clamp(36px,4vw,56px)" }}>
            <div className="sec-head rv" style={{ margin: 0 }}>
              <h2 className="title">{t("f003", "Notre accompagnement")}</h2>
              <p className="lead">{t("f004", "Grâce à son partenariat avec les leaders mondiaux de l'hygiène, EPUREAU Côte d’Ivoire optimise la propreté, la sécurité sanitaire et alimentaire ainsi que les coûts d'exploitation, tout en garantissant la conformité aux normes les plus exigeantes.")}</p>
            </div>
            <figure className="photo illustrated-photo rv">
              <Image unoptimized                 src={t("f005", "/images/illustrations/hygiene.webp")}
                alt={t("f006", "technicienne ouest-africaine dans une buanderie professionnelle")}
                width={640}
                height={480}
                style={{ objectPosition: "70% 50%" }}
              />
              <figcaption>{t("f007", "Entretien du linge")}</figcaption>
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
        titre={t("f008", "Un plan d'hygiène à mettre en place ou à revoir ?")}
        texte={t("f009", "Nos techniciens réalisent l'audit de vos protocoles et vous proposent les équipements de dosage adaptés.")}
      />
    </>
  ) <AdditionalBlocks page="hygiene-institutionnelle" /></>;
}
