import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {productList} from "@/lib/cms";
import {siteLanguage} from "@/lib/site-language";
import {uiText} from "@/content/ui-english";
import {productCategory, publicProduct, validProductDocument} from "@/content/product-catalog";
import ProductCards from "@/components/ProductCards";
import ProductDocumentForm from "@/components/ProductDocumentForm";
import Icon from "@/components/Icon";

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {slug}=await params;const product=(await productList()).find(p=>p.slug===slug);
  return {title:product ? `${product.nom} — ${uiText(product.marque,await siteLanguage())}` : uiText("Produit",await siteLanguage()),description:product?.texte};
}
export default async function ProductPage({params}:Props) {
  const {slug}=await params;
  const products=await productList();const product=products.find(p=>p.slug===slug);
  if(!product)notFound();
  const language=await siteLanguage();const prefix="/"+language;
  const t=(text:string)=>uiText(text,language);
  const related=products.filter(p=>p.slug!==slug&&p.marque===product.marque).slice(0,3).map(publicProduct);
  return <>
    <section className="sec product-detail"><div className="wrap">
      <nav className="product-breadcrumb" aria-label={t("Fil d’Ariane")}><Link href={`${prefix}/negoce#catalogue`}>{t("Catalogue produits")}</Link><span aria-hidden="true"> / </span><span>{product.nom}</span></nav>
      <div className="product-detail-grid"><div>
        <div className={"produit-visuel product-detail-visual"+(product.image?"":" sans-visuel")}>{product.image?<Image unoptimized src={product.image} alt={product.nom} width={900} height={600} priority />:<><Icon name={product.marque==="NALCO"?"droplet":"flask"}/><span className="product-reference-visual">{product.reference||product.nom}</span></>}<span className="produit-marque">{t(product.marque)}</span></div>
      </div><div><span className="eyebrow">{t(productCategory(product))}</span><h1 className="title">{product.nom}</h1><p className="lead">{product.texte}</p>
        <dl className="product-specs">{[["Référence",product.reference],["Gamme",product.gamme],["Application",product.usage],["Secteurs",product.secteurs],["Conditionnement",product.forme]].filter(([,value])=>value).map(([label,value])=><div key={label}><dt>{t(label!)}</dt><dd>{value}</dd></div>)}</dl>
        <Link className="btn btn-primary" href={`${prefix}/contact?produit=${encodeURIComponent(product.nom)}#form`}>{t("Demander un devis")} <Icon name="arrow"/></Link>
        <p className="catalog-note">{t("Disponibilité, conditionnement et adéquation à votre installation à confirmer avec notre équipe. Prix sur devis.")}</p>
      </div></div>
      <div className="product-detail-grid product-detail-bottom"><div><h2>{t("Points clés")}</h2><ul className="produit-points">{(product.points||"").split("\n").filter(Boolean).map((point,i)=><li key={i}><Icon name="check"/>{point}</li>)}</ul><p className="catalog-note">{t("Consultez la documentation fabricant et la fiche de données de sécurité avant utilisation.")}</p></div>
        <ProductDocumentForm slug={slug} available={Boolean(product.fiche&&validProductDocument(product.fiche))} documentType={product.documentType||"Fiche technique"} documentLanguage={product.documentLangue||""} prefix={prefix}/>
      </div>
    </div></section>
    {related.length>0&&<section className="sec alt"><div className="wrap"><h2 className="title">{t("À découvrir également")}</h2><ProductCards produits={related} prefix={prefix}/></div></section>}
  </>;
}
