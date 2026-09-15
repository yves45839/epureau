import type { MetadataRoute } from "next";

const BASE = "https://www.epureau-ci.com";

export default function sitemap(): MetadataRoute.Sitemap {
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
  return pages.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
