import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHeader, BandeAppel } from "@/components/ui";
import { realisations } from "@/content/site";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description:
    "Stations d'épuration conçues, installées et mises en service par EPUREAU CI : EUROLAIT, CHR d'Adzopé, PISAM, MIPA et GARDEN Center.",
};

export default function NosRealisations() {
  return (
    <>
      <PageHeader
        fil={["Ingénierie de l'eau", "Nos réalisations"]}
        titre="Des stations conçues, installées et mises en service"
        lead="Chez EPUREAU CI, chaque projet est une nouvelle opportunité de mettre notre expertise au service de nos clients et de contribuer à un avenir durable."
      />

      <section className="sec">
        <div className="wrap">
          <div className="projects rvs">
            {realisations.map((r) => (
              <article className="proj" key={r.slug}>
                <div className="im">
                  <Image src={r.image} alt={`Réalisation ${r.nom}`} width={640} height={400} />
                  <span className="veil" />
                  <div className="cap">
                    <span className="t">{r.type}</span>
                    <span className="c">
                      {r.debit}
                      <small>{r.unite}</small>
                    </span>
                  </div>
                </div>
                <div className="bd">
                  <h3>{r.nom}</h3>
                  <span className="cl">{r.client}</span>
                  <p>{r.texte}</p>
                  <Link className="arrow-link more" href="/mediatheque#photos">
                    Photos du chantier <Icon name="arrow" />
                  </Link>
                </div>
              </article>
            ))}

            <div className="proj-end">
              <span className="eyebrow">Votre site</span>
              <h3>La prochaine station est peut-être la vôtre</h3>
              <p>
                Décrivez-nous l&apos;effluent, le débit et les contraintes du site : nous établissons
                une note de dimensionnement et une proposition chiffrée.
              </p>
              <Link className="btn btn-light" href="/contact">
                Demander une cotation <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BandeAppel />
    </>
  );
}
