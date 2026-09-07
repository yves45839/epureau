import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import { SectionHead, BandeAppel, ChiffresCles } from "@/components/ui";
import { chiffres, clients, domaines, realisations } from "@/content/site";

export default function Accueil() {
  return (
    <>
      <Hero />
      <ChiffresCles items={chiffres} />

      <section className="sec" id="domaines">
        <div className="wrap">
          <SectionHead
            center
            eyebrow="Nos domaines d'intervention"
            titre="Quatre métiers, une même exigence sur la qualité de l'eau"
            lead="De l'étude d'une station d'épuration à la fourniture quotidienne de produits formulés, EPUREAU CI couvre l'ensemble de la chaîne."
          />
          <div className="domains rvs">
            {domaines.map((d) => (
              <Link className="dcard" href={d.lien} key={d.titre}>
                <div className="im">
                  <Image src={d.image} alt={d.alt} width={640} height={360} />
                </div>
                <span className="pastille">
                  <Icon name={d.icone} />
                </span>
                <div className="bd">
                  <h3>{d.titre}</h3>
                  <p>{d.texte}</p>
                  <span className="arrow-link">
                    {d.lienTexte} <Icon name="arrow" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
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

      <section className="sec alt">
        <div className="wrap">
          <div className="about">
            <div className="text rv">
              <span className="eyebrow">Qui sommes-nous ?</span>
              <h2 className="title">
                Experts en ingénierie de l&apos;eau, au service de l&apos;industrie ivoirienne
              </h2>
              <p className="lead" style={{ marginTop: 18 }}>
                EPUREAU CI est une Société par Actions Simplifiée (SAS), créée et basée en Côte
                d&apos;Ivoire depuis octobre 2015. Précédemment filiale du groupe MARBOUR, société
                française, elle a rejoint <strong>YANGONDI HOLDING</strong>.
              </p>
              <p className="lead">
                Spécialisée dans le traitement des eaux (potable, usée, industrielle), EPUREAU CÔTE
                D&apos;IVOIRE associe à son ingénierie prouvée en potabilisation et épuration des
                eaux le savoir-faire des marques ECOLAB et NALCO.
              </p>
              <div style={{ marginTop: 26 }}>
                <Link className="btn btn-ghost" href="/a-propos">
                  Découvrir l&apos;entreprise <Icon name="arrow" />
                </Link>
              </div>
            </div>
            <div className="collage rv">
              <figure className="f1">
                <Image src="/images/apropos-1.jpg" alt="Local technique d'une station EPUREAU" width={640} height={480} />
                <figcaption>STEP EUROLAIT · 270 m³/j</figcaption>
              </figure>
              <figure className="f2">
                <Image src="/images/apropos-2.jpg" alt="Unité de traitement, CHR d'Adzopé" width={640} height={360} />
                <figcaption>CHR d&apos;Adzopé · 90 m³/j</figcaption>
              </figure>
              <figure className="f3">
                <Image src="/images/apropos-3.jpg" alt="Bassins de traitement, GARDEN Center" width={640} height={360} />
                <figcaption>GARDEN Center</figcaption>
              </figure>
              <div className="badge" aria-hidden="true">
                <div>
                  <b>2015</b>
                  <small>Côte d&apos;Ivoire</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionHead
            eyebrow="Nos réalisations"
            titre="Des stations conçues, installées et mises en service"
            lead="Chaque projet est une nouvelle opportunité de mettre notre expertise au service de nos clients et de contribuer à un avenir durable."
          />
          <div className="projects rvs">
            {realisations.slice(0, 3).map((r) => (
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
