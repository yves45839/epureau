import AdditionalBlocks from "@/components/AdditionalBlocks";
import { pageValues, company } from "@/lib/cms";
import type { Metadata } from "next";
import ComplaintForm from "@/components/ComplaintForm";

export const metadata: Metadata = {
  title: "Réclamation client",
  description: "Signalez un problème concernant un produit, une prestation ou une livraison à EPUREAU Côte d’Ivoire.",
};

export default async function ComplaintPage() {
  const values = await pageValues("reclamation-client");
  const t = (id: string, fallback: string) => values[id] ?? fallback;
  const societe = await company();


  return <> <section className="sec customer-page"><div className="wrap customer-layout">
    <div className="customer-intro"><span className="eyebrow">{t("f001", "À votre écoute")}</span><h1 className="title">{t("f002", "Réclamation client")}</h1><p className="lead">{t("f003", "Un problème avec un produit, une prestation ou une livraison ? Donnez-nous les éléments nécessaires pour comprendre la situation et vous accompagner.")}</p>
      <ol className="customer-steps"><li><b>{t("f004", "Décrivez votre demande")}</b><span>{t("f005", "Précisez le produit ou la prestation, le site et les faits constatés.")}</span></li><li><b>{t("f006", "Conservez votre référence")}</b><span>{t("f007", "Une référence s’affiche après réception de votre réclamation.")}</span></li><li><b>{t("f008", "Échangez avec notre équipe")}</b><span>{t("f009", "Nous vous recontactons pour examiner votre demande et la suite à donner.")}</span></li></ol>
      <div className="customer-contact"><b>{t("f010", "Besoin de nous joindre ?")}</b><a href={`tel:${societe.telephoneLien}`}>{societe.telephone}</a><a href={`mailto:${societe.email}`}>{societe.email}</a><span>{societe.horairesLong}</span></div>
    </div><ComplaintForm />
  </div></section> <AdditionalBlocks page="reclamation-client" /></>;
}
