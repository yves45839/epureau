import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import PhotoBanner from "@/components/PhotoBanner";
import Icon from "@/components/Icon";
import { SectionHead, BandeAppel } from "@/components/ui";
import { clients, domaines, realisations } from "@/content/site";
import { visuelsDomaines } from "@/content/illustrations";

export default function Accueil() {
  return (
    <>
      <Hero />

      <section className="sec" id="domaines">
        <div className="wrap">
          <SectionHead
            center
            eyebrow="EPUREAU Côte d'Ivoire"
            titre="Nos domaines d'intervention"
          />
          <div className="domains visual-domains rvs">
            {domaines.map((d, i) => (
              <Link className="dcard visual-domain" href={d.lien} key={d.titre}>
                <div className="im">
                  <Image src={visuelsDomaines[i].src} alt={visuelsDomaines[i].alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw" style={{ objectPosition: i === 3 ? "20% 50%" : visuelsDomaines[i].position }} />
                </div>
                <span className="domain-index mono" aria-hidden="true">0{i + 1}</span>
                <div className="bd">
                  <h3>{d.titre}</h3>

                  <span className="arrow-link">
                    {d.lienTexte} <Icon name="arrow" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="illustration-note">Visuels métiers : illustrations générées.</p>
        </div>
      </section>

      <div className="marquee">
        <span className="lbl">Ils nous font confiance</span>
        <div className="track">
          {[...clients, ...clients].map((c, i) => (
            <span key={`${c}-${i}`}>{c}</span>
          ))}
        </div>
      </div>

      <PhotoBanner />

      <section className="sec alt">
        <div className="wrap">
          <div className="about">
            <div className="text rv">
              <span className="eyebrow">Qui sommes-nous ?</span>
              <h2 className="title">EPUREAU Côte d&apos;Ivoire</h2>
              <p className="lead" style={{ marginTop: 18 }}>EPUREAU CI est une Société par Actions Simplifiée (SAS), créée et basée en Côte d&apos;Ivoire depuis octobre 2015.</p>
              <div style={{ marginTop: 26 }}>
                <Link className="btn btn-ghost" href="/a-propos">
                  Découvrir l&apos;entreprise <Icon name="arrow" />
                </Link>
              </div>
            </div>
            <figure className="native-photo rv"><Image src="/images/projets-ci/abidjan-laiterie-process.jpg" alt="Installation de traitement réalisée avec EPUREAU à Abidjan" width={799} height={601} sizes="(max-width: 900px) 100vw, 50vw" /><figcaption>Station de traitement des eaux · Abidjan</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionHead
            eyebrow="Ingénierie du traitement de l'eau"
            titre="Nos réalisations"
          />
          <div className="projects rvs">
            {realisations.slice(0, 3).map((r) => (
              <article className="proj" key={r.slug}>
                <div className="im">
                  <Image src={r.image} alt={`Réalisation ${r.nom}`} width={640} height={245} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" />
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

                  <Link className="arrow-link more" href="/ingenierie/nos-realisations">
                    Voir la réalisation <Icon name="arrow" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <Link className="btn btn-ghost" href="/ingenierie/nos-realisations">
              Toutes nos réalisations <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <BandeAppel />
    </>
  );
}
