import PageSections from "@/components/PageSections";
import { pageValues } from "@/lib/cms";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHeader, BandeAppel } from "@/components/ui";
import { projectList } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description:
    "Stations d'épuration conçues, installées et mises en service par EPUREAU Côte d’Ivoire : EUROLAIT, CHR D’ADZOPÉ, PISAM, MIPA et GARDEN CENTER.",
};

export default async function NosRealisations() {
  const realisations = await projectList();
  const values = await pageValues("ingenierie-nos-realisations");
  const t = (id: string, fallback: string) => values[id] ?? fallback;



  return <PageSections page="ingenierie-nos-realisations" values={values}>
<PageHeader
        fil={["Ingénierie de l'eau", "Nos réalisations"]}
        titre={t("f001", "Nos réalisations")}
        lead={t("f002", "Stations conçues, installées et mises en service.")}
      />
<section className="sec">
        <div className="wrap">
          <div className="projects rvs">
            {realisations.map((r) => (
              <article className="proj" key={r.slug} id={r.slug}>
                <div className="im">
                  <Image unoptimized src={r.image} alt={`Réalisation ${r.nom}`} width={640} height={245} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" />
                  </div>
                  <div className="cap">
                    <span className="t">{r.type}</span>
                    <span className="c">
                      {r.debit}
                      <small>{r.unite}</small>
                    </span>
                  </div><div className="bd">
                  <h3>{r.nom}</h3>
                  <span className="cl">{r.client}</span>
                  <details className="project-details"><summary>{t("f003", "Le projet en détail")}</summary><p>{r.texte}</p></details>
                  <Link className="arrow-link more" href="/mediatheque#photos">{t("f004", "Photos du chantier ")}<Icon name="arrow" />
                  </Link>
                </div>
              </article>
            ))}

            <div className="proj-end">
              <span className="eyebrow">{t("f005", "Votre site")}</span>
              <h3>{t("f006", "La prochaine station est peut-être la vôtre")}</h3>
              <p>{t("f007", "Décrivez-nous l'effluent, le débit et les contraintes du site : nous établissons une note de dimensionnement et une proposition chiffrée.")}</p>
              <Link className="btn btn-light" href="/contact">{t("f008", "Demander une cotation ")}<Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>
<BandeAppel />
</PageSections>;
}
