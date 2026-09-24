import type { Product } from "./admin-types";

export const productCategory = (product: Product) => product.categorie?.trim() || product.gamme?.trim() || product.marque;
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function filterProducts(products: Product[], search: string, brand: string, category: string) {
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
  return products.filter(p => (!brand || p.marque === brand) && (!category || productCategory(p) === category)
    && terms.every(term => normalize([p.nom, p.reference, p.marque, productCategory(p), p.texte, p.usage, p.secteurs].join(" ")).includes(term)));
}
// Only expose fields needed by the browser. Document URLs stay on the server
// until the e-mail form has been accepted, including in React's RSC payload.
export function publicProduct(product: Product): Product {
  const {slug,nom,marque,gamme,usage,secteurs,forme,points,image,texte,categorie,reference}=product;
  return {slug,nom,marque,gamme,usage,secteurs,forme,points,image,texte,categorie,reference};
}
export function validProductDocument(value: string) {
  if (/^\/api\/media\/[a-f0-9-]{36}\.pdf$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && /\.pdf$/i.test(url.pathname);
  } catch { return false; }
}
