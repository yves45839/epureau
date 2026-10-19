import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      // Search discovery: the same public/private boundaries apply to every crawler.
      { userAgent: ["OAI-SearchBot", "PerplexityBot"], allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: "https://epureau-ci.com/sitemap.xml",
  };
}
