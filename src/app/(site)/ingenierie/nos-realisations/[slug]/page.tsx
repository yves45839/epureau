import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import Image from "@/components/SiteImage";
import Icon from "@/components/Icon";
import Galerie from "@/components/Galerie";
import {projectList,mediaList} from "@/lib/cms";
import {siteLanguage,siteText,localizedMetadata} from "@/lib/site-language";
import {projectPath,projectName} from "@/content/projects";

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {slug}=await params;
  const project=(await projectList()).find(project=>project.slug===slug);
  return localizedMetadata({title:project?.nom,description:project?.texte});
}

export default async function ProjectPage({params}:Props) {
  const {slug}=await params;
  const projects=await projectList();
  const project=projects.find(project=>project.slug===slug);
  if(!project)notFound();
  const language=await siteLanguage(),ui=await siteText(),prefix="/"+language;
  const name=projectName(project.nom);
  const photos=(await mediaList()).filter(media=>name&&media.type==="photo"&&media.url&&projectName(media.title+" "+media.album).includes(name)).map(media=>({image:media.url,legende:media.title}));
  const related=projects.filter(other=>other.slug!==slug);
  return <>
    <section className="sec project-detail"><div className="wrap">
      <nav className="product-breadcrumb" aria-label={ui("Fil d’Ariane")}><Link href={`${prefix}/ingenierie/nos-realisations`}>{ui("Nos réalisations")}</Link><span aria-hidden="true"> / </span><span>{project.nom}</span></nav>
      <div className="project-detail-grid"><div><span className="eyebrow">{project.type}</span><h1 className="title">{project.nom}</h1><p className="project-client">{project.client}</p><p className="lead">{project.texte}</p>
        <dl className="product-specs"><div><dt>{ui("Procédé")}</dt><dd>{project.type}</dd></div><div><dt>{ui("Capacité")}</dt><dd>{project.debit} {project.unite}</dd></div></dl>
        <Link className="btn btn-primary" href={`${prefix}/contact`}>{ui("Parler de mon projet")} <Icon name="arrow"/></Link>
      </div><figure className="project-detail-photo"><Image src={project.image} alt={`${ui("Projet")} ${project.nom}`} width={640} height={245} sizes="(max-width: 800px) 100vw, 50vw" loading="eager"/><figcaption>{project.nom} · {project.type}</figcaption></figure></div>
    </div></section>
    {photos.length>0&&<section className="sec alt"><div className="wrap"><h2 className="title">{ui("Photos du chantier")}</h2><Galerie items={photos}/></div></section>}
    {related.length>0&&<section className="sec"><div className="wrap"><span className="eyebrow">{ui("À découvrir également")}</span><h2 className="title">{ui("Nos autres réalisations")}</h2><div className="projects project-related">{related.map(other=><article className="proj" key={other.slug}><Link className="im" href={prefix+projectPath(other.slug)} aria-label={`${ui("Voir le projet")} ${other.nom}`}><Image src={other.image} alt="" width={640} height={245} sizes="(max-width: 600px) 100vw, 33vw"/></Link><div className="bd"><span className="eyebrow">{other.type}</span><h3><Link href={prefix+projectPath(other.slug)}>{other.nom}</Link></h3><span className="cl">{other.client}</span><Link className="arrow-link more" href={prefix+projectPath(other.slug)}>{ui("Voir le projet")} <Icon name="arrow"/></Link></div></article>)}</div></div></section>}
  </>;
}
