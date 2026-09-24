import {socialLinks} from "@/content/social-links";
import {siteText, localizedMetadata} from "@/lib/site-language";
import PageSections from "@/components/PageSections";
import { pageValues, company, publishedDocuments, productList } from "@/lib/cms";
import { lieuGoogle } from "@/content/site";
import MapEmbed from "@/components/MapEmbed";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import QuoteForm from "@/components/QuoteForm";

const baseMetadata: Metadata = {
  title: "Nous contacter",
  description:
    "Demande de cotation, question technique ou projet à étudier : l'équipe EPUREAU Côte d’Ivoire vous répond du lundi au vendredi.",
};

export default async function Contact({searchParams}:{searchParams:Promise<{produit?:string;secteur?:string}>}) {
  const query=await searchParams;
  const secteur=typeof query.secteur==="string"?query.secteur.slice(0,200):"";
  const produit=typeof query.produit==="string"?query.produit.slice(0,200):"";
  const productBrand=produit?(await productList()).find(p=>p.nom===produit)?.marque:"";
  const values = await pageValues("contact");
  const ui=await siteText();
  const t = (id: string, fallback: string) => ui(values[id] ?? fallback);
  const societe = await company();
  const parametres = (await publishedDocuments("settings"))[0]?.data ?? {};
  const social = ([
    ["linkedin", "LinkedIn"],
    ["facebook", "Facebook"],
    ["youtube", "YouTube"],
  ] as const).map(([cle, libelle]) => ({ cle, libelle, url: socialLinks(parametres)[cle] })).filter(r => r.url);


  return <PageSections page="contact" values={values}>
<section className="sec" id="contact">
      <div className="wrap">
        <div className="contact">
          <div className="rv">
            <span className="eyebrow">{t("f001", "Nous contacter")}</span>
            <h1 className="title">{t("f002", "Une demande de cotation, une question technique ou un projet à étudier ?")}</h1>
            <p className="lead" style={{ marginTop: 18 }}>{t("f003", "Notre équipe vous répond du lundi au vendredi. Chaque demande est transmise à nos équipes et suivie jusqu'à la remise d'une proposition.")}</p>

            <div className="coords">
              <a className="coord" href={societe.maps} target="_blank" rel="noopener">
                <span className="ic">
                  <Icon name="pin" />
                </span>
                <span>
                  <small>{t("f004", "Siège")}</small>
                  <b>{societe.adresse}</b>
                  <br />
                  <span style={{ fontSize: 13, color: "var(--g500)" }}>
                    {societe.boitePostale}{t("f005", " · Ouvrir dans Google Maps")}</span>
                </span>
              </a>
              <a className="coord" href={`tel:${societe.telephoneLien}`}>
                <span className="ic">
                  <Icon name="phone" />
                </span>
                <span>
                  <small>{t("f006", "Téléphone")}</small>
                  <b>{societe.telephone}</b>
                </span>
              </a>
              <a className="coord" href={`mailto:${societe.email}`}>
                <span className="ic">
                  <Icon name="mail" />
                </span>
                <span>
                  <small>{t("f007", "E-mail")}</small>
                  <b>{societe.email}</b>
                </span>
              </a>
              <div className="coord">
                <span className="ic">
                  <Icon name="clock" />
                </span>
                <span>
                  <small>{t("f008", "Horaires")}</small>
                  <b>{societe.horairesLong}</b>
                </span>
              </div>
            </div>

            {social.length > 0 && (
              <div className="reseaux">
                <span className="reseaux-titre">{t("f009", "Nous suivre")}</span>
                {social.map(r => (
                  <a key={r.cle} className={"reseau-logo " + r.cle} href={r.url} target="_blank" rel="noopener" aria-label={r.libelle + " — EPUREAU Côte d’Ivoire"} title={r.libelle}>
                    <Icon name={r.cle} />
                  </a>
                ))}
              </div>
            )}

            <MapEmbed lieu={lieuGoogle} adresse={societe.adresse} />
          </div>

          <QuoteForm product={produit} productBrand={productBrand} sector={secteur} />
        </div>
      </div>
    </section>
</PageSections>;
}

export async function generateMetadata(){return localizedMetadata(baseMetadata);}
