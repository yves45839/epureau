import UiText from "./UiText";
import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import { company, publishedDocuments } from "@/lib/cms";
import { customPagePath } from "@/content/page-builder";
import CookieLink from "./CookieLink";

export default async function Footer() {
  const societe = await company();
  const settings = (await publishedDocuments("settings"))[0]?.data;
  const extraPages = (await publishedDocuments("pages")).filter(p=>customPagePath(p.key)&&p.data.__navigation==="oui");
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="flogo" href="/" aria-label="EPUREAU Côte d’Ivoire — accueil">
              <Image src="/images/logo.png" alt="EPUREAU Côte d’Ivoire" width={560} height={162} />
            </Link>
            <p><UiText text={" Experts en ingénierie du traitement de l'eau : conception et réalisation de stations, service aux industries, hygiène institutionnelle et négoce des produits NALCO et ECOLAB. "} /></p>
            <p style={{ fontSize: 13, opacity: 0.75 }}>
              {societe.groupe} · {societe.adresse}
            </p>
          </div>

          <div>
            <h5><UiText text={"Ingénierie de l'eau"} /></h5>
            <ul>
              <li><Link href="/ingenierie/notre-expertise"><UiText text={"Notre expertise"} /></Link></li>
              <li><Link href="/ingenierie/nos-realisations"><UiText text={"Nos réalisations"} /></Link></li>
              <li><Link href="/service-aux-industries"><UiText text={"Service aux industries"} /></Link></li>
              <li><Link href="/hygiene-institutionnelle"><UiText text={"Hygiène institutionnelle"} /></Link></li>
            </ul>
          </div>

          <div>
            <h5><UiText text={"Produits"} /></h5>
            <ul>
              <li><Link href="/negoce#nalco"><UiText text={"Produits NALCO"} /></Link></li>
              <li><Link href="/negoce#ecolab"><UiText text={"Produits ECOLAB"} /></Link></li>
              <li><Link href="/negoce#commodites"><UiText text={"Commodités & réactifs"} /></Link></li>
              <li><Link href="/mediatheque#brochures"><UiText text={"Brochures"} /></Link></li>
              <li><Link href="/carriere"><UiText text={"Carrière"} /></Link></li>
{settings?.blogEnabled === "oui" && <li><Link href="/blog"><UiText text={"Blog"} /></Link></li>}
{settings?.legal && <li><Link href="/mentions-legales"><UiText text={"Mentions légales"} /></Link></li>}
{settings?.privacy && <li><Link href="/confidentialite"><UiText text={"Confidentialité"} /></Link></li>}
<li><CookieLink /></li>
{(["linkedin","facebook","youtube"] as const).some(key => settings?.[key]) && <li className="footer-reseaux">{(["linkedin","facebook","youtube"] as const).map(key => settings?.[key] && <a key={key} className={"reseau-logo " + key} href={settings[key]} target="_blank" rel="noreferrer" aria-label={(key === "linkedin" ? "LinkedIn" : key === "facebook" ? "Facebook" : "YouTube") + " — EPUREAU Côte d’Ivoire"} title={key === "linkedin" ? "LinkedIn" : key === "facebook" ? "Facebook" : "YouTube"}><Icon name={key} /></a>)}</li>}
            </ul>
          </div>

          <div>
            <h5><UiText text={"Contact"} /></h5>
            <ul>
              <li><a href={`tel:${societe.telephoneLien}`}>{societe.telephone}</a></li>
              <li><a href={`mailto:${societe.email}`}>{societe.email}</a></li>
              <li><Link href="/reclamation-client"><UiText text={"Réclamation client"} /></Link></li>
              <li><span style={{ fontSize: 14, color: "rgba(255,255,255,.85)" }}>{societe.horaires}</span></li>
              <li>
                <Link className="arrow-link" href="/contact" style={{ color: "var(--cyan-2)" }}><UiText text={" Formulaire de cotation "} /><Icon name="arrow" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {extraPages.length>0&&<nav className="footer-extra-pages" aria-label="Autres pages">{extraPages.map(p=><Link key={p.key} href={customPagePath(p.key)!}>{p.data.title}</Link>)}</nav>}
        <div className="fbot">
          <span>© {new Date().getFullYear()} {societe.nom}<UiText text={" — Tous droits réservés"} /></span>
          <span>{societe.site}</span>
        </div>
      </div>
    </footer>
  );
}
