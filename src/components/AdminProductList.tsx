"use client";
import {useState} from "react";
import type {Document} from "@/content/admin-types";
import type {Entry} from "@/lib/admin-store";
import {productHidden} from "@/content/product-visibility";

export default function AdminProductList({rows,search,selected,dirty,onChoose,onUpdated}:{rows:Entry<Document>[];search:string;selected?:string;dirty:boolean;onChoose:(row:Entry<Document>)=>void;onUpdated:(rows:Entry<Document>[])=>void}) {
  const [brand,setBrand]=useState(""),[visibility,setVisibility]=useState("");
  const [checked,setChecked]=useState<string[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  const products=rows.filter(row=>!row.value.deleted);
  const brands=[...new Set(products.map(row=>row.value.draft.marque).filter(Boolean))].sort();
  const visible=products.filter(row=>(!brand||row.value.draft.marque===brand)&&(!visibility||(visibility==="hidden"?productHidden(row.value):visibility==="published"?Boolean(row.value.published)&&!productHidden(row.value):!row.value.published))&&[row.value.title,row.value.draft.nom,row.value.draft.reference,row.value.draft.marque].join(" ").toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));
  async function changeVisibility(targets:Entry<Document>[],hidden:boolean) {
    if(!targets.length||busy||dirty)return;
    setBusy(true);setMessage("");setError("");
    try {
      const response=await fetch("/api/admin/products/visibility",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({hidden,items:targets.map(({key,revision})=>({key,revision}))})});
      const result=await response.json();if(!response.ok)throw new Error(result.message||"Modification impossible.");
      onUpdated(result.records);setChecked([]);
      setMessage(`${result.records.length} produit(s) ${hidden?"masqué(s)":"réaffiché(s)"}.`+(!hidden&&targets.some(row=>!row.value.published)?" Les brouillons restent à publier.":""));
    } catch(error){setError((error as Error).message);}finally{setBusy(false);}
  }
  return <div className="admin-products">
    <div className="admin-product-filters"><label>Marque<select value={brand} onChange={event=>setBrand(event.target.value)}><option value="">Toutes les marques</option>{brands.map(value=><option key={value}>{value}</option>)}</select></label><label>Visibilité<select value={visibility} onChange={event=>setVisibility(event.target.value)}><option value="">Tous les produits</option><option value="published">Visibles sur le site</option><option value="hidden">Masqués</option><option value="draft">Brouillons</option></select></label></div>
    <p className="admin-info">Masquer retire la fiche du site sans supprimer son contenu. Réafficher conserve la dernière version publiée.</p>
    <fieldset disabled={busy||dirty} className="admin-product-bulk">
      <label className="admin-product-check"><input type="checkbox" checked={visible.length>0&&visible.every(row=>checked.includes(row.key))} onChange={event=>setChecked(event.target.checked?[...new Set([...checked,...visible.map(row=>row.key)])]:checked.filter(key=>!visible.some(row=>row.key===key)))} />Sélectionner les résultats ({visible.length})</label>
      <span>{checked.length} sélectionné(s)</span>
      <div><button type="button" className="admin-button secondary" disabled={!checked.length} onClick={()=>changeVisibility(products.filter(row=>checked.includes(row.key)),true)}>Masquer la sélection</button><button type="button" className="admin-button secondary" disabled={!checked.length} onClick={()=>changeVisibility(products.filter(row=>checked.includes(row.key)),false)}>Réafficher la sélection</button></div>
      {checked.length>0&&<button type="button" onClick={()=>setChecked([])}>Effacer la sélection</button>}
    </fieldset>
    {dirty&&<p className="admin-info">Enregistrez le brouillon avant de modifier la visibilité.</p>}
    {message&&<p role="status" className="admin-success">{message}</p>}{error&&<p role="alert" className="admin-error">{error}</p>}
    <div className="admin-product-results">{visible.map(row=><div className={"admin-product-row"+(selected===row.key?" selected":"")} key={row.key}>
      <input type="checkbox" aria-label={"Sélectionner "+row.value.title} disabled={busy||dirty} checked={checked.includes(row.key)} onChange={event=>setChecked(event.target.checked?[...checked,row.key]:checked.filter(key=>key!==row.key))}/>
      <button type="button" className="admin-content-item" disabled={busy} onClick={()=>onChoose(row)}><b>{row.value.title}</b><span>{row.value.draft.marque} · {productHidden(row.value)?"Masqué":row.value.published?"Visible sur le site":"Brouillon"}{productHidden(row.value)&&!row.value.published?" · Brouillon":""}</span></button>
      <button type="button" className="admin-product-toggle" disabled={busy||dirty} aria-label={(productHidden(row.value)?"Réafficher ":"Masquer ")+row.value.title} onClick={()=>changeVisibility([row],!productHidden(row.value))}>{productHidden(row.value)?"Réafficher":"Masquer"}</button>
    </div>)}</div>
    {!visible.length&&<p>Aucun produit ne correspond à ces critères.</p>}
  </div>;
}
