import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icon";
import Galerie from "@/components/Galerie";
import { PageHeader, SectionHead, BandeAppel } from "@/components/ui";
import { brochures, videos } from "@/content/site";

export const metadata: Metadata = {
  title: "Médiathèque",
  description:
    "Photos de chantiers, films institutionnels et documentation à télécharger : présentation EPUREAU CI, portfolio des réalisations et flyers sectoriels.",
};

export default function Mediatheque() {
  return (
    <>
      <PageHeader
        fil={["Médiathèque"]}
        titre="Photos de chantiers, films institutionnels et documentation"
        lead="Nos films institutionnels et nos reportages de chantier montrent concrètement comment nos équipes conçoivent, installent et exploitent les unités de traitement en Côte d'Ivoire."
      />

      <section className="sec">
        <div className="wrap">
          <div className="media">
            <div className="vids rvs" id="videos">
              {videos.map((v) => (
                <div className="vid" key={v.titre}>
                  <span className="th">
                    <Image src={v.vignette} alt="" width={480} height={300} />
                    <span className="pl">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 4l14 8-14 8z" />
                      </svg>
                    </span>
                  </span>
                  <span>
                    <b>{v.titre}</b>
                    <span>{v.sous}</span>
                  </span>
                  <span className="dur">{v.duree}</span>
                </div>
              ))}
            </div>

            <div className="docs rvs" id="brochures">
              {brochures.map((b) => (
                <div className="doc" key={b.titre}>
                  <span className="ic">
                    <Icon name="download" />
                  </span>
                  <span>
                    <b>{b.titre}</b>
                    <span>{b.sous}</span>
                  </span>
                  <span className="sz">{b.taille}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="encart rv" style={{ marginTop: 34 }}>
            <b>Contenus en cours d&apos;intégration</b>
            <p>
              Les vidéos et les brochures seront mises en ligne dès réception des fichiers
              définitifs. Les photos ci-dessous sont issues de nos chantiers ; les originaux haute
              définition remplaceront ces visuels à la publication.
            </p>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <SectionHead
            eyebrow="Galerie photos"
            titre="Nos chantiers et nos installations"
            lead="Terrassement, pose des cuves, équipements de process et unités en service."
          />
          <Galerie />
        </div>
      </section>

      <BandeAppel />
    </>
  );
}
