import UiText from "./UiText";
import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import type { Product } from "@/content/admin-types";

const ICONES: Record<string, string> = { "NALCO": "droplet", "ECOLAB": "flask", "Commodités & Réactifs": "boxes" };

/** Fiches produits d'une marque, alimentées depuis l'administration (rubrique Produits). */
export default function ProductCards({ produits, marque }: { produits: Product[]; marque: string }) {
  const liste = produits.filter(p => p.marque === marque);
  if (!liste.length) return null;

  return (
    <div className="produits rvs">
      {liste.map(p => {
        const points = (p.points || "").split("\n").map(v => v.trim()).filter(Boolean).slice(0, 6);
        const attributs = ([["Application", p.usage], ["Secteurs", p.secteurs], ["Conditionnement", p.forme]] as const).filter(([, valeur]) => valeur);
        return (
          <article className="produit" key={p.slug}>
            <div className={"produit-visuel" + (p.image ? "" : " sans-visuel")}>
              {p.image
                ? <Image unoptimized src={p.image} alt={"Produit " + p.nom} width={640} height={380} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                : <Icon name={ICONES[p.marque] || "droplet"} />}
              <span className="produit-marque">{p.marque}</span>
            </div>
            <div className="produit-corps">
              {p.gamme && <span className="produit-gamme">{p.gamme}</span>}
              <h3>{p.nom}</h3>
              {p.texte && <p className="produit-texte">{p.texte}</p>}
              {attributs.length > 0 && (
                <dl className="produit-attributs">
                  {attributs.map(([libelle, valeur]) => (
                    <div key={libelle}><dt><UiText text={libelle} /></dt><dd>{valeur}</dd></div>
                  ))}
                </dl>
              )}
              {points.length > 0 && (
                <ul className="produit-points">
                  {points.map(point => <li key={point}><Icon name="check" />{point}</li>)}
                </ul>
              )}
              <Link className="arrow-link" href="/contact"><UiText text={"Demander une cotation "} /><Icon name="arrow" /></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
