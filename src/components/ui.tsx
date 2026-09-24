import {siteText} from "@/lib/site-language";
import UiText from "./UiText";
import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import AnimatedNumber from "./AnimatedNumber";

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
      <span className={`eyebrow${vert ? " vert" : ""}`}><UiText text={eyebrow} /></span>
      <h2 className="title">{typeof titre==="string"?<UiText text={titre}/>:titre}</h2>
      {lead && <p className="lead">{typeof lead==="string"?<UiText text={lead}/>:lead}</p>}
    </div>
  );
}

/** En-tête marine des pages internes. */
export async function PageHeader({
  fil,
  titre,
  lead,
  image,
}: {
  fil: string[];
  titre: string;
  lead: string;
  image?: string;
}) {
  const ui=await siteText();
  return (
    <section className={`pagehead${image ? " photo-pagehead" : ""}`}>
      {image && <Image src={image} alt="" fill sizes="100vw" preload />}
      <div className="wrap">
        <nav className="fil" aria-label={ui("Fil d'Ariane")}>
          <Link href="/"><UiText text="Accueil" /></Link>
          {fil.map((f, i) => (
            <span key={f}>
              <span aria-hidden="true"> · </span>
              <span className={i === fil.length - 1 ? "on" : ""}><UiText text={f} /></span>
            </span>
          ))}
        </nav>
        <h1><UiText text={titre} /></h1>
        <p><UiText text={lead} /></p>
      </div>
    </section>
  );
}

/** Renvoi vers le formulaire unique — présent au bas de chaque rubrique. */
export function BandeAppel({
  titre = "Demander une cotation",
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
          <h2><UiText text={titre} /></h2>
          <p><UiText text={texte} /></p>
        </div>
        <Link className="btn btn-primary" href="/contact">
          <UiText text={libelle} /> <Icon name="arrow" />
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
              <AnimatedNumber value={c.valeur} animate={c.valeur !== "2015"} />
            </b>
            <span><UiText text={c.legende} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
