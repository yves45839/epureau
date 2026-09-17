import PageSections from "@/components/PageSections";
import type { Metadata } from "next";
import { pageValues,mediaList,publishedDocuments } from "@/lib/cms";
import { PageHeader,SectionHead,BandeAppel } from "@/components/ui";
import Galerie from "@/components/Galerie";
import MediaVideo from "@/components/MediaVideo";
export const metadata:Metadata={title:"Médiathèque",description:"Photos, vidéos et brochures d’EPUREAU Côte d’Ivoire"};
export default async function Mediatheque(){
 const values=await pageValues("mediatheque");
 const t=(id:string,fallback:string)=>values[id]??fallback;
 const media=await mediaList();const brochures=await publishedDocuments("brochures");
 return <PageSections page="mediatheque" values={values}>
<PageHeader fil={["Médiathèque"]} titre={t("f001","Photos de chantiers, films institutionnels et documentation")} lead={t("f002","Découvrez nos réalisations et nos documents de présentation.")} />
<section className="sec"><div className="wrap"><h2 id="videos">Galerie vidéos</h2><div className="cms-videos">{media.filter(m=>m.type==="video").map(m=><article key={m.id}><MediaVideo url={m.url} image={m.image} title={m.title} /><h3>{m.title}</h3><p>{m.description}</p></article>)}</div><h2 id="brochures">Brochures</h2><div className="docs">{brochures.map(({key,data})=><article className="doc" key={key}><div><h3>{data.title}</h3><p>{data.description}</p></div>{data.url?<a className="btn btn-primary" href={"/api/brochures/"+key} target="_blank" rel="noreferrer">Télécharger le PDF</a>:<span>Document à venir</span>}</article>)}</div></div></section>
<section className="sec alt"><div className="wrap"><SectionHead eyebrow={t("f005","Galerie photos")} titre={t("f006","Nos chantiers et nos installations")} lead={t("f007","Terrassement, pose des cuves, équipements de process et unités en service.")} /><Galerie items={media.filter(m=>m.type==="photo"&&m.url).map(m=>({image:m.url,legende:m.title,album:m.album}))} /></div></section>
<BandeAppel />
</PageSections>;
}
