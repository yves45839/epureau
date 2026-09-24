import type { MetadataRoute } from "next";
import { publishedDocuments } from "@/lib/cms";
import { customPagePath } from "@/content/page-builder";

const BASE = "https://www.epureau-ci.com";

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
  return pages.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
