"use client";

import {useState} from "react";
import type {Product} from "@/content/admin-types";
import {filterProducts, productCategory} from "@/content/product-catalog";
import {marquesProduits} from "@/content/products";
import {useUi} from "./UiText";
import ProductCards from "./ProductCards";

export default function ProductCatalog({products, prefix = ""}:{products:Product[];prefix?:string}) {
  const ui=useUi();
  const [search,setSearch]=useState("");
  const [brand,setBrand]=useState("");
  const [category,setCategory]=useState("");
  const categories=[...new Set(products.filter(p=>!brand||p.marque===brand).map(productCategory))];
  const visible=filterProducts(products,search,brand,category);
  const groups=[...new Set(visible.map(productCategory))];
  return <div className="product-catalog" id="catalogue">
    <span className="eyebrow">{ui("Catalogue produits")}</span>
    <h2 className="title">{ui("La solution adaptée à votre activité")}</h2>
    <p className="lead">{ui("Explorez nos produits par marque et par catégorie. Consultez une fiche produit ou demandez un devis personnalisé.")}</p>
    <div className="catalog-filters" role="search" aria-label={ui("Filtrer les produits")}>
      <label>{ui("Rechercher un produit")}<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={ui("Nom, référence, application…")} /></label>
      <label>{ui("Marque")}<select value={brand} onChange={e=>{setBrand(e.target.value);setCategory("");}}><option value="">{ui("Toutes les marques")}</option>{marquesProduits.filter(m=>products.some(p=>p.marque===m)).map(m=><option key={m} value={m}>{m}</option>)}</select></label>
      <label>{ui("Catégorie")}<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">{ui("Toutes les catégories")}</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    </div>
    <div className="catalog-results"><p role="status">{visible.length} {ui("produit(s)")}</p>{(search||brand||category)&&<button type="button" onClick={()=>{setSearch("");setBrand("");setCategory("");}}>{ui("Réinitialiser les filtres")}</button>}</div>
    {groups.map(group=><section className="catalog-group" key={group} aria-label={group}><h3>{group}</h3><ProductCards produits={visible.filter(p=>productCategory(p)===group)} prefix={prefix} /></section>)}
    {!visible.length&&<div className="catalog-empty"><h3>{ui("Aucun produit ne correspond à votre recherche.")}</h3><p>{ui("Modifiez vos filtres ou contactez notre équipe pour une référence précise.")}</p></div>}
    <p className="catalog-note">{ui("Disponibilité, conditionnement et adéquation à votre installation à confirmer avec notre équipe. Prix sur devis.")}</p>
  </div>;
}
