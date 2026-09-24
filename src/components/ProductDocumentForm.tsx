"use client";
import {useState, type FormEvent} from "react";
import Link from "next/link";
import {useUi} from "./UiText";

export default function ProductDocumentForm({slug, documentType, documentLanguage, available, prefix}:{slug:string;documentType:string;documentLanguage:string;available:boolean;prefix:string}) {
  const ui=useUi();
  const [state,setState]=useState<"idle"|"sending"|"done"|"error">("idle");
  const [url,setUrl]=useState("");
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setState("sending");setError("");
    try {
      const data=Object.fromEntries(new FormData(event.currentTarget));
      const response=await fetch(`/api/products/${encodeURIComponent(slug)}/document`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.message||"Enregistrement indisponible. Réessayez dans un instant.");
      setUrl(result.url||"");setState("done");
    } catch(error) {setError(error instanceof Error?error.message:"Enregistrement indisponible. Réessayez dans un instant.");setState("error");}
  }
  return <section className="product-document" id="fiche-technique" aria-labelledby="document-title">
    <span className="eyebrow">{ui("Documentation")}</span><h2 id="document-title">{ui("Obtenir la fiche technique")}</h2>
    <p>{available ? documentType==="Brochure fabricant" ? ui("Brochure fabricant disponible immédiatement. Votre demande de fiche technique sera également enregistrée pour notre équipe.") : ui("Renseignez votre e-mail pour accéder au document fabricant.") : ui("Renseignez votre e-mail : notre équipe préparera la fiche technique correspondant à votre besoin.")}</p>
    {available&&<p className="document-meta">{ui(documentType)} · PDF{documentLanguage ? ` · ${documentLanguage}` : ""}</p>}
    {state==="done" ? <div className="document-success" role="status"><h3>{ui("Votre demande est enregistrée.")}</h3>{url ? <a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer">{ui(documentType==="Brochure fabricant"?"Ouvrir la brochure fabricant":"Ouvrir la fiche technique")} ↗</a> : <p>{ui("Notre équipe vous recontactera pour vous transmettre le document adapté.")}</p>}</div> : <form onSubmit={submit}>
      <label htmlFor="product-email">{ui("E-mail professionnel")} *</label><input id="product-email" name="email" type="email" autoComplete="email" required maxLength={160} disabled={state==="sending"} />
      <input name="site" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="product-honeypot" />
      <p className="document-privacy">{ui("Votre e-mail est utilisé pour traiter cette demande et son suivi technique, sans inscription à une newsletter.")} <Link href={`${prefix}/confidentialite`}>{ui("Confidentialité")}</Link></p>
      <button className="btn btn-primary" disabled={state==="sending"}>{ui(state==="sending"?"Envoi en cours…":available?"Accéder au document":"Demander la fiche technique")}</button>
      {state==="error"&&<p role="alert">{ui(error)}</p>}
    </form>}
  </section>;
}
