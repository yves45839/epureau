import PageSections from "@/components/PageSections";
import { pageValues, company } from "@/lib/cms";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Carrière",
  description: "Rejoignez les plus de 40 collaborateurs d’EPUREAU Côte d’Ivoire. Découvrez nos métiers et proposez votre candidature spontanée.",
};

export default async function CareerPage() {
  const values = await pageValues("carriere");
  const t = (id: string, fallback: string) => values[id] ?? fallback;
  const societe = await company();


  return <PageSections page="carriere" values={values}>
<section className="career-hero"><div className="wrap career-grid"><div><span className="eyebrow">{t("f001", "Carrière")}</span><h1>{t("f002", "Votre talent,")}<br />{t("f003", "nos projets de demain")}</h1><p>{t("f004", "Rejoignez une équipe de plus de 40 collaborateurs engagés dans le traitement de l’eau, les services aux industries et l’hygiène institutionnelle en Côte d’Ivoire.")}</p><a href="#candidature" className="btn btn-primary">{t("f005", "Proposer ma candidature")}</a></div><img src={t("f006", "/images/illustrations/ingenierie.webp")} width="1672" height="941" alt={t("f007", "Illustration de nos métiers : une équipe d’ingénierie sur une installation de traitement de l’eau")} /></div></section>
<section className="sec"><div className="wrap"><div className="sec-head"><span className="eyebrow">{t("f008", "Nos métiers")}</span><h2 className="title">{t("f009", "Des compétences qui se complètent")}</h2><p className="lead">{t("f010", "Des études au terrain, de l’accompagnement technique à la relation client, découvrez les activités de ")}{societe.nom}{t("f011", ".")}</p></div><div className="career-domains">
      <Link href="/ingenierie/notre-expertise"><span>{t("f012", "01")}</span><h3>{t("f013", "Ingénierie de l’eau")}</h3><p>{t("f014", "Études, conception, réalisation et exploitation des ouvrages")}</p></Link>
      <Link href="/service-aux-industries"><span>{t("f015", "02")}</span><h3>{t("f016", "Services aux industries")}</h3><p>{t("f017", "Optimisation des installations et accompagnement technique")}</p></Link>
      <Link href="/hygiene-institutionnelle"><span>{t("f018", "03")}</span><h3>{t("f019", "Hygiène institutionnelle")}</h3><p>{t("f020", "Solutions d’hygiène, équipements et conseil")}</p></Link>
      <Link href="/negoce"><span>{t("f021", "04")}</span><h3>{t("f022", "Produits chimiques")}</h3><p>{t("f023", "Produits, réactifs et relation client")}</p></Link>
    </div></div></section>
<section className="sec alt" id="candidature"><div className="wrap career-application"><div><span className="eyebrow">{t("f024", "Candidature spontanée")}</span><h2 className="title">{t("f025", "Faisons connaissance")}</h2><p className="lead">{t("f026", "Présentez votre parcours, vos compétences et le métier qui vous intéresse. Joignez votre CV à votre e-mail et indiquez vos disponibilités.")}</p></div><div className="career-apply-card"><h3>{t("f027", "Envoyer votre candidature")}</h3><p>{t("f028", "Préparez un CV au format PDF et quelques lignes de présentation.")}</p><a className="btn btn-primary" href={`mailto:${societe.email}?subject=${encodeURIComponent("Candidature spontanée — EPUREAU Côte d’Ivoire")}`}>{t("f029", "Candidater par e-mail ↗")}</a><p className="customer-note">{t("f030", "Ce bouton ouvre votre messagerie. Vous pouvez également écrire à ")}<a href={`mailto:${societe.email}`}>{societe.email}</a>{t("f031", ".")}</p></div></div></section>
</PageSections>;
}
