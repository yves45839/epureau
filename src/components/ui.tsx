import Link from "next/link";
import Icon from "./Icon";

export function SectionHead({
  eyebrow,
  titre,
  lead,
  center = false,
  vert = false,
  style,
}: {
  eyebrow: string;
  titre: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
  vert?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`sec-head rv${center ? " center" : ""}`} style={style}>
      <span className={`eyebrow${vert ? " vert" : ""}`}>{eyebrow}</span>
      <h2 className="title">{titre}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

/** En-tête marine des pages internes. */
export function PageHeader({
  fil,
  titre,
  lead,
}: {
  fil: string[];
  titre: string;
  lead: string;
}) {
  return (
    <section className="pagehead">
      <div className="wrap">
        <nav className="fil" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          {fil.map((f, i) => (
            <span key={f}>
              <span aria-hidden="true"> · </span>
              <span className={i === fil.length - 1 ? "on" : ""}>{f}</span>
            </span>
          ))}
        </nav>
        <h1>{titre}</h1>
        <p>{lead}</p>
      </div>
    </section>
  );
}

/** Renvoi vers le formulaire unique — présent au bas de chaque rubrique. */
export function BandeAppel({
  titre = "Un besoin de traitement d'eau ou d'hygiène industrielle ?",
  texte = "Décrivez-nous votre installation : nous revenons vers vous avec une proposition chiffrée.",
  libelle = "Demander une cotation",
}: {
  titre?: string;
  texte?: string;
  libelle?: string;
}) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div className="rv">
          <h2>{titre}</h2>
          <p>{texte}</p>
        </div>
        <Link className="btn btn-primary" href="/contact">
          {libelle} <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}

export function ChiffresCles({ items }: { items: { valeur: string; exposant: string; legende: string }[] }) {
  return (
    <div className="keyfig">
      <div className="wrap">
        {items.map((c) => (
          <div className="stat" key={c.legende}>
            <b>
              {c.exposant && <sup>{c.exposant}</sup>}
              {c.valeur}
            </b>
            <span>{c.legende}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
