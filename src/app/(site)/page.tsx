import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import PhotoBanner from "@/components/PhotoBanner";
import Icon from "@/components/Icon";
import { SectionHead } from "@/components/ui";
import { clients, domaines, realisations } from "@/content/site";

export default function Accueil() {
  return (
    <>
      <Hero />

      <section className="product-access" id="domaines" aria-labelledby="products-title">
        <div className="wrap rv">
          <div>
            <h2 id="products-title">{domaines[3].titre}</h2>
            <p>NALCO · ECOLAB · Commodités &amp; réactifs</p>
          </div>
          <Link href={domaines[3].lien} className="btn btn-ghost">{domaines[3].lienTexte}<Icon name="arrow" /></Link>
        </div>
      </section>

      <div className="marquee">
        <span className="lbl">Ils nous font confiance</span>
        <div className="track">
          {[...clients, ...clients].map((c, i) => (
            <span key={`${c}-${i}`} aria-hidden={i >= clients.length ? true : undefined}>{c}</span>
          ))}
        </div>
      </div>

      <PhotoBanner />

      <section className="sec">
        <div className="wrap">
          <SectionHead
            eyebrow="Chantiers et installations"
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

                  <Link className="arrow-link more" href={`/ingenierie/nos-realisations#${r.slug}`}>
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

    </>
  );
}
