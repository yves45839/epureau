import type { ContentData, Document } from "./admin-types";

// Update the former métier name in saved CMS copy as well as bundled defaults.
export function industryLabel(text: string) {
  return text.replace(/Les services aux industries/g, "Industries et travaux publics")
    .replace(/Services? aux industries/g, "Industries et travaux publics")
    .replace(/services? aux industries/g, "industries et travaux publics")
    .replace(/Industrial services/g, "Industry and public works")
    .replace(/industrial services/g, "industry and public works");
}
export function updatedIndustryDocument(key: string, document: Document): Document {
  const update = (data: ContentData): ContentData => {
    const next = Object.fromEntries(Object.entries(data).map(([field, value]) => [field, industryLabel(value)]));
    if (key === "accueil" && data.f038 === "Services" && data.f039 === "aux industries") {
      next.f038 = "Industries";
      next.f039 = "et travaux publics";
    }
    return next;
  };
  return {...document, title:industryLabel(document.title), draft:update(document.draft), published:document.published ? update(document.published) : null};
}
