import type { MetadataRoute } from "next";
import { publishedDocuments } from "@/lib/cms";
import { customPagePath } from "@/content/page-builder";
import { projectPath } from "@/content/projects";

import {localizedUrl} from "@/content/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/a-propos",
    "/ingenierie/notre-expertise",
    "/ingenierie/nos-realisations",
    "/service-aux-industries",
    "/hygiene-institutionnelle",
    "/negoce",
    "/mediatheque",
    "/contact",
    "/carriere",
    "/reclamation-client",
  ];
  for(const page of await publishedDocuments("pages",false)){const path=customPagePath(page.key);if(path)pages.push(path);}
  for(const product of await publishedDocuments("products",false))pages.push("/negoce/"+encodeURIComponent(product.key));
  for(const project of await publishedDocuments("projects",false))pages.push(projectPath(project.key));
  const settings=(await publishedDocuments("settings",false))[0]?.data;
  if(settings?.blogEnabled==="oui"){
   pages.push("/blog");
   for(const article of await publishedDocuments("blog",false))pages.push("/blog/"+encodeURIComponent(article.key));
  }
  return [...new Set(pages)].flatMap(p=>(["fr","en"] as const).map(language=>({
   url:localizedUrl(p,language),
   alternates:{languages:{fr:localizedUrl(p,"fr"),en:localizedUrl(p,"en"),"x-default":localizedUrl(p,"fr")}}
  })));
}
