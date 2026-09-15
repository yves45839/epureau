import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import { company, publishedDocuments } from "@/lib/cms";

export default async function Footer() {
  const societe = await company();
  const settings = (await publishedDocuments("settings"))[0]?.data;
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="flogo" href="/" aria-label="EPUREAU Côte d’Ivoire — accueil">
              <Image src="/images/logo.png" alt="EPUREAU Côte d’Ivoire" width={560} height={162} />
            </Link>
            <p>
              Experts en ingénierie du traitement de l&apos;eau : conception et réalisation de
              stations, service aux industries, hygiène institutionnelle et négoce des produits
              NALCO et ECOLAB.
            </p>
            <p style={{ fontSize: 13, opacity: 0.75 }}>
              {societe.groupe} · {societe.adresse}
            </p>
          </div>

          <div>
            <h5>Ingénierie de l&apos;eau</h5>
            <ul>
              <li><Link href="/ingenierie/notre-expertise">Notre expertise</Link></li>
              <li><Link href="/ingenierie/nos-realisations">Nos réalisations</Link></li>
              <li><Link href="/service-aux-industries">Service aux industries</Link></li>
              <li><Link href="/hygiene-institutionnelle">Hygiène institutionnelle</Link></li>
            </ul>
          </div>

          <div>
            <h5>Produits</h5>
            <ul>
              <li><Link href="/negoce#nalco">Produits NALCO</Link></li>
              <li><Link href="/negoce#ecolab">Produits ECOLAB</Link></li>
              <li><Link href="/negoce#commodites">Commodités &amp; réactifs</Link></li>
              <li><Link href="/mediatheque#brochures">Brochures</Link></li>
              <li><Link href="/carriere">Carrière</Link></li>
{settings?.blogEnabled === "oui" && <li><Link href="/blog">Blog</Link></li>}
{settings?.legal && <li><Link href="/mentions-legales">Mentions légales</Link></li>}
{settings?.privacy && <li><Link href="/confidentialite">Confidentialité</Link></li>}
{(["linkedin","facebook","youtube"] as const).map(key => settings?.[key] && <li key={key}><a href={settings[key]} target="_blank" rel="noreferrer">{key === "linkedin" ? "LinkedIn" : key === "facebook" ? "Facebook" : "YouTube"}</a></li>)}
            </ul>
          </div>

          <div>
            <h5>Contact</h5>
            <ul>
              <li><a href={`tel:${societe.telephoneLien}`}>{societe.telephone}</a></li>
              <li><a href={`mailto:${societe.email}`}>{societe.email}</a></li>
              <li><Link href="/reclamation-client">Réclamation client</Link></li>
              <li><span style={{ fontSize: 14, color: "rgba(255,255,255,.85)" }}>{societe.horaires}</span></li>
              <li>
                <Link className="arrow-link" href="/contact" style={{ color: "var(--cyan-2)" }}>
                  Formulaire de cotation <Icon name="arrow" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="fbot">
          <span>© {new Date().getFullYear()} {societe.nom} — Tous droits réservés</span>
          <span>{societe.site}</span>
        </div>
      </div>
    </footer>
  );
}
