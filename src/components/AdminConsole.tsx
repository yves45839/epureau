"use client";
import Link from "next/link";
import ContentField from "./AdminContentField";
import PageBuilder from "./PageBuilder";
import AdminAudience from "./AdminAudience";
import AdminDashboard from "./AdminDashboard";
import Icon from "./Icon";
import {customPagePath,validPageSlug,emptyBlock} from "@/content/page-builder";
import { useEffect, useState } from "react";
import type { Identity } from "@/lib/auth";
import type { Entry } from "@/lib/admin-store";
import type { CustomerRequest } from "@/lib/admin-requests";
import type { ContentData, Document, PageDefinition } from "@/content/admin-types";
import type { Rapport } from "@/lib/audience";
import type { Overview } from "@/lib/admin-overview";
import { may } from "@/content/admin-access";
type Field={key:string;label:string;type?:string};
type Payload={data:unknown[];fields?:Field[];pages?:PageDefinition[];team?:{id:string;name:string}[];audience?:Rapport;overview?:Overview};
const sections:Record<string,string>={dashboard:"Vue d’ensemble",requests:"Demandes & réclamations",pages:"Pages du site",projects:"Réalisations",products:"Produits",media:"Médiathèque",brochures:"Brochures",blog:"Blog",settings:"Paramètres",users:"Utilisateurs",audience:"Audience",audit:"Journal des accès"};
const labels:Record<string,string>={nouvelle:"Nouvelle",en_cours:"En cours",traitee:"Traitée"};
const roleNames:Record<string,string>={admin:"Administrateur",editeur:"Éditeur",commercial:"Commercial"};
const groupes:{titre:string;cles:string[]}[]=[
 {titre:"Pilotage",cles:["dashboard","audience"]},
 {titre:"Relation client",cles:["requests"]},
 {titre:"Contenus du site",cles:["pages","projects","products","media","brochures","blog"]},
 {titre:"Administration",cles:["settings","users","audit"]},
];
const icones:Record<string,string>={dashboard:"grid",audience:"chart",requests:"mail",pages:"layout",projects:"factory",products:"tag",media:"image",brochures:"file",blog:"pen",settings:"gear",users:"users",audit:"list"};
const creations:Record<string,string>={pages:"Créer une page",projects:"Ajouter une réalisation",products:"Ajouter un produit",media:"Ajouter un média",brochures:"Ajouter une brochure",blog:"Ajouter un article",users:"Ajouter un compte"};
async function request(url:string,body?:unknown){
 const result=await fetch(url,{method:body?"POST":"GET",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const json=await result.json();if(!result.ok)throw new Error(json.message||"Opération impossible.");return json;
}
export default function AdminConsole({user,initial,local}:{user:Identity;initial:Payload;local:boolean}){
 const [creatingPage,setCreatingPage]=useState(false);
 const [section,setSection]=useState("dashboard"),[payload,setPayload]=useState(initial),[selected,setSelected]=useState<Entry<Document>|null>(null);
 const [menu,setMenu]=useState(false);
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[search,setSearch]=useState(""),[status,setStatus]=useState(""),[month,setMonth]=useState(""),[dirty,setDirty]=useState(false),[jours,setJours]=useState(30);
 useEffect(()=>{document.body.style.overflow=menu?"hidden":"";return()=>{document.body.style.overflow="";};},[menu]);
 async function open(next:string,saved=false){
  if(dirty&&!saved&&!confirm("Quitter sans enregistrer vos modifications ?"))return;
  setLoading(true);setError("");setDirty(false);setSelected(null);setSearch("");
  try{const data=await request("/api/admin/content?section="+next+(next==="audience"?"&jours="+jours:""));setPayload(data);setSection(next);}catch(e){setError((e as Error).message);}finally{setLoading(false);}
 }
 const requests=(section==="dashboard"||section==="requests"?payload.data:[]) as Entry<CustomerRequest>[];
 const filtered=requests.filter(({value:r})=>(!status||r.statut===status)&&(!month||r.cree_le.startsWith(month))&&[r.nom,r.societe,r.objet,r.email,r.besoin].join(" ").toLowerCase().includes(search.toLowerCase()));
 const rows=payload.data as Entry<Document>[];
 function choose(row:Entry<Document>){if(dirty&&!confirm("Quitter sans enregistrer vos modifications ?"))return;setSelected(row);setDirty(Boolean(customPagePath(row.key)&&row.revision===0));}
 function create(){
  if(section==="pages"){setCreatingPage(true);return;}
  const key=section==="users"?"":crypto.randomUUID();
  choose({key,revision:0,updated:"",value:{title:"Nouveau contenu",draft:section==="media"?{type:"photo"}:{},published:null,order:rows.length}});
 }
 return <div className="admin-app">
  <aside className={"admin-sidebar"+(menu?" ouvert":"")} id="admin-nav">
   <Link className="admin-brand" href="/"><img src="/images/logo.png" width="560" height="162" alt="EPUREAU Côte d’Ivoire" /></Link>
   <span className="admin-caption">ESPACE ADMINISTRATION</span>
   <nav aria-label="Administration">
    {groupes.map(groupe=>{
     const items=groupe.cles.filter(cle=>sections[cle]&&may(user.role,cle));
     if(!items.length)return null;
     return <div className="admin-groupe" key={groupe.titre}>
      <span className="admin-groupe-titre">{groupe.titre}</span>
      {items.map(cle=>{
       const compteur=cle==="requests"?payload.overview?.demandes.nouvelles??0:cle==="users"?payload.overview?.comptes?.enAttente??0:0;
       return <button type="button" key={cle} aria-current={section===cle?"page":undefined} onClick={()=>{setMenu(false);open(cle);}} disabled={loading}>
        <Icon name={icones[cle]||"grid"} />{sections[cle]}{compteur>0&&<em aria-label={compteur+" en attente"}>{compteur}</em>}
       </button>;
      })}
     </div>;
    })}
   </nav>
   <div className="admin-account"><b>{user.name}</b><small>{roleNames[user.role]}</small><form action="/api/admin/login" method="post"><input type="hidden" name="_method" value="delete" /><button type="submit">Se déconnecter ↗</button></form></div>
  </aside>
  {menu&&<button type="button" className="admin-voile" aria-label="Fermer le menu" onClick={()=>setMenu(false)} />}
  <main className="admin-main">
   <header className="admin-top">
    <div className="admin-top-titre">
     <button type="button" className="admin-burger" aria-expanded={menu} aria-controls="admin-nav" aria-label={menu?"Fermer le menu":"Ouvrir le menu"} onClick={()=>setMenu(v=>!v)}><Icon name={menu?"x":"menu"} /></button>
     <div><span className="admin-kicker">EPUREAU Côte d’Ivoire</span><h1>{sections[section]}</h1></div>
    </div>
    <div className="admin-top-actions">
     {creations[section]&&may(user.role,section)&&<button type="button" className="admin-button" onClick={create} disabled={loading}><Icon name="plus" />{creations[section]}</button>}
     <a className="admin-button secondary" href="/" target="_blank" rel="noreferrer">Voir le site ↗</a>
    </div>
   </header>
   {local&&<p className="admin-local">Version locale · Les données sont conservées sur cet ordinateur. Aucune publication sur Internet.</p>}
   {error&&<p role="alert" className="admin-error">{error}</p>}
   {loading?<p role="status">Chargement…</p>:<>
   {section==="dashboard"&&<AdminDashboard user={user} overview={payload.overview} requests={requests} onOpen={open} />}
   {section==="requests"&&<><div className="admin-filters"><label>Rechercher<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, société, objet…" /></label><label>Statut<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Mois<input type="month" value={month} onChange={e=>setMonth(e.target.value)} /></label><a className="admin-button secondary" href={"/api/admin/content?section=requests&format=csv&status="+status+"&month="+month}>Exporter CSV</a></div><p>{filtered.length} demande(s)</p><div className="admin-request-list">{filtered.map(row=><RequestCard key={row.key+row.revision} row={row} team={payload.team||[]} onSaved={()=>open("requests")} />)}{!filtered.length&&<div className="admin-card admin-empty">Aucune demande ne correspond à ces critères.</div>}</div></>}
   {section==="audit"&&<div className="admin-card">{(payload.data as Entry<{actor:string;action:string;date:string}>[]).map(r=><div className="admin-list-line" key={r.key}><div><b>{r.value.action}</b><p>{r.value.actor}</p></div><time>{new Date(r.value.date).toLocaleString("fr-FR")}</time></div>)}</div>}
   {section==="audience"&&<AdminAudience rapport={payload.audience} jours={jours} onJours={async valeur=>{setJours(valeur);setLoading(true);setError("");try{const data=await request("/api/admin/content?section=audience&jours="+valeur);setPayload(data);}catch(e){setError((e as Error).message);}finally{setLoading(false);}}} />}
   {!["dashboard","requests","audit","audience"].includes(section)&&<>
    {section==="blog"&&<p className="admin-info">Le blog reste masqué tant que « Blog actif » n’est pas réglé sur « oui » dans les paramètres publiés.</p>}
    <div className="admin-content-grid"><div className="admin-content-list"><label className="admin-search">Rechercher<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un contenu" /></label>{section!=="settings"&&<button className="admin-button" onClick={create}>+ {section==="users"?"Ajouter un compte":section==="pages"?"Créer une page":section==="products"?"Ajouter un produit":"Ajouter un contenu"}</button>}
    {section==="pages"&&creatingPage&&<NewPageForm existing={rows.map(r=>r.key)} onCancel={()=>setCreatingPage(false)} onCreate={(slug,title)=>{choose({key:"custom-"+slug,revision:0,updated:"",value:{title,draft:{title,description:"",__navigation:"oui",__layout:JSON.stringify({version:1,sections:[{...emptyBlock("text",crypto.randomUUID()),title:"Bienvenue",text:"Présentez votre contenu ici."}]})},published:null,order:rows.length}});setCreatingPage(false);}} />}
    {section==="pages"&&rows.some(r=>r.value.deleted)&&<details className="builder-trash"><summary>Corbeille</summary>{rows.filter(r=>r.value.deleted).map(r=><div key={r.key}><span>{r.value.title}</span><button type="button" onClick={async()=>{try{await request("/api/admin/content",{section:"pages",key:r.key,revision:r.revision,action:"restore"});await open("pages");}catch(e){setError((e as Error).message);}}}>Restaurer en brouillon</button></div>)}</details>}
    {section==="users"&&rows.some(r=>(r.value as unknown as {active?:boolean}).active===false)&&<p className="admin-info">Des demandes d’accès attendent une activation : ouvrez le compte, vérifiez le rôle puis passez « Compte actif » à « oui ».</p>}
     {rows.filter(r=>!r.value.deleted).filter(r=>(r.value.title||String((r.value as unknown as {name?:string}).name||r.key)).toLowerCase().includes(search.toLowerCase())).map(row=><button className={"admin-content-item "+(selected?.key===row.key?"selected":"")} key={row.key} onClick={()=>choose(row)}><b>{row.value.title||(row.value as unknown as {name:string}).name||row.key}</b><span>{section==="users"?row.key:row.value.published?"Publié":"Brouillon"}</span></button>)}
    {["media","brochures"].includes(section)&&<BulkUpload section={section} onDone={()=>open(section)} />}
    </div><div>{selected?section==="users"?<UserEditor key={selected.key+selected.revision} row={selected} onSaved={()=>open("users",true)} onDirty={setDirty} />:<DocumentEditor key={section+selected.key} section={section} row={selected} fields={section==="pages"?payload.pages?.find(p=>p.key===selected.key)?.fields||(customPagePath(selected.key)?[{key:"title",label:"Titre de la page"},{key:"description",label:"Description pour les moteurs de recherche",type:"long"}]:[]):payload.fields||[]} page={payload.pages?.find(p=>p.key===selected.key)?.path} onDirty={setDirty} onSaved={row=>{setDirty(false);setSelected(row);setPayload({...payload,data:[...rows.filter(r=>r.key!==row.key),row]});}} onDeleted={()=>open(section)} />:<div className="admin-card admin-empty"><h2>Choisissez un contenu</h2><p>Sélectionnez un élément dans la liste pour le modifier.</p></div>}</div></div>
   </>}
   </>}
  </main>
 </div>;
}
function RequestCard({row,team,onSaved}:{row:Entry<CustomerRequest>;team:{id:string;name:string}[];onSaved:()=>void}){
 const d=row.value;const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");try{await request("/api/admin/content",{section:"requests",key:row.key,revision:row.revision,action:"save",data:Object.fromEntries(new FormData(e.currentTarget))});onSaved();}catch(e){setError((e as Error).message);setBusy(false);}}
 return <article className="admin-card"><div className="admin-row"><div><span className="admin-kicker">{d.source==="reclamation"?"Réclamation client":"Demande de cotation"}</span><h2>{d.societe}</h2><p>{d.nom} · <a href={"mailto:"+d.email}>{d.email}</a> {d.telephone&&"· "+d.telephone}</p></div><span className={"admin-badge "+d.statut}>{labels[d.statut]}</span></div><small>{new Date(d.cree_le).toLocaleString("fr-FR")}</small><h3>{d.objet}</h3><p className="admin-request-text">{d.besoin}</p><form onSubmit={submit}><fieldset disabled={busy}><div className="admin-filters"><label>Statut<select name="statut" defaultValue={d.statut}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Affecter à<select name="assigned" defaultValue={d.assigned}><option value="">Non affectée</option>{team.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label></div><label>Note interne<textarea name="note" rows={2} maxLength={4000} placeholder="Compte rendu de l’échange, prochaine action…" /></label><button className="admin-button">{busy?"Enregistrement…":"Enregistrer le suivi"}</button></fieldset></form>{error&&<p role="alert" className="admin-error">{error}</p>}<details><summary>Historique ({d.history.length})</summary>{d.history.map((h,i)=><p key={i}><b>{h.actor}</b> · {new Date(h.date).toLocaleString("fr-FR")}<br />{h.message}</p>)}</details></article>;
}
function DocumentEditor({section,row,fields,page,onSaved,onDeleted,onDirty}:{section:string;row:Entry<Document>;fields:Field[];page?:string;onSaved:(row:Entry<Document>)=>void;onDeleted:()=>void;onDirty:(dirty:boolean)=>void}){
 const [data,setData]=useState<ContentData>({...row.value.draft}),[title,setTitle]=useState(row.value.title),[order,setOrder]=useState(row.value.order),[filter,setFilter]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(""),[dirty,setDirty]=useState(Boolean(customPagePath(row.key)&&row.revision===0));
 useEffect(()=>{const leave=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue="";}};window.addEventListener("beforeunload",leave);return()=>window.removeEventListener("beforeunload",leave);},[dirty]);
 function change(key:string,value:string){setData(old=>({...old,[key]:value}));setDirty(true);onDirty(true);}
 async function act(action:string){
  if((action==="delete"||action==="unpublish")&&!confirm(action==="delete"?"Retirer ce contenu du site ?":"Retirer la version publiée ?"))return;
  setBusy(true);setError("");setMessage("");
  try{const result=await request("/api/admin/content",{section,key:row.key,revision:row.revision,title,order,data,action});setDirty(false);onDirty(false);if(action==="delete"){onDeleted();return;}onSaved(result.record);setMessage(action==="publish"?"Modifications publiées.":action==="unpublish"?"Contenu retiré du site.":"Brouillon enregistré.");}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }

 const preview=page||customPagePath(row.key)||({projects:"/ingenierie/nos-realisations",products:"/negoce",media:"/mediatheque",brochures:"/mediatheque",blog:"/blog",settings:"/"} as Record<string,string>)[section];
 return <div className="admin-card admin-editor"><div className="admin-row"><h2>{row.value.title}</h2><span className="admin-badge">{dirty?"Non enregistré":row.value.published?"Version publiée":"Brouillon"}</span></div><p className="admin-info">Enregistrez votre brouillon, vérifiez l’aperçu, puis publiez.</p><div className="admin-editor-actions"><button className="admin-button secondary" disabled={busy} onClick={()=>act("save")}>Enregistrer le brouillon</button><a className={"admin-button secondary "+(dirty?"disabled":"")} aria-disabled={dirty} onClick={e=>{if(dirty)e.preventDefault();}} href={"/api/admin/preview?path="+encodeURIComponent(preview)} target="_blank" rel="noreferrer">Aperçu ↗</a><button className="admin-button" disabled={busy} onClick={()=>act("publish")}>Publier</button></div>{message&&<p role="status" className="admin-success">{message}</p>}{error&&<p role="alert" className="admin-error">{error}</p>}
 <fieldset disabled={busy}><div className="admin-filters"><label>Titre dans la liste<input value={title} onChange={e=>{setTitle(e.target.value);setDirty(true);onDirty(true);}} maxLength={200} /></label>{!["pages","settings"].includes(section)&&<label>Ordre d’affichage<input type="number" min="0" max="9999" value={order} onChange={e=>{setOrder(Number(e.target.value));setDirty(true);onDirty(true);}} /></label>}</div>
 {section!=="pages"&&fields.length>15&&<label>Filtrer les champs<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Titre, texte, image…" /></label>}
 {section!=="pages"&&fields.filter(f=>[f.label,data[f.key]].join(" ").toLowerCase().includes(filter.toLowerCase())).map(field=><ContentField key={field.key} field={field} value={data[field.key]??""} onChange={v=>change(field.key,v)} />)}
 {section==="pages"&&<><p className="admin-info">Adresse : <a href={preview} target="_blank" rel="noreferrer">{preview}</a></p>{customPagePath(row.key)&&<label>Afficher un lien dans le pied de page<select value={data.__navigation||"non"} onChange={e=>change("__navigation",e.target.value)}><option value="oui">Oui</option><option value="non">Non</option></select></label>}<PageBuilder page={row.key} data={data} fields={fields} onChange={change} /></>}
 </fieldset><div className="admin-danger">{(section!=="settings"&&(section!=="pages"||customPagePath(row.key)))&&<><button disabled={busy} onClick={()=>act("unpublish")}>Dépublier</button><button disabled={busy} onClick={()=>act("delete")}>Supprimer ce contenu</button></>}</div></div>;
}
function BulkUpload({section,onDone}:{section:string;onDone:()=>void}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function upload(files:FileList|null){
 if(!files?.length||busy)return;setBusy(true);setMessage("");let count=0;
 try{for(const file of Array.from(files)){const form=new FormData();form.set("file",file);const r=await fetch("/api/admin/upload",{method:"POST",body:form});const result=await r.json();if(!r.ok)throw new Error(result.message);const title=file.name.replace(/\.[^.]+$/,"");await request("/api/admin/content",{section,key:crypto.randomUUID(),revision:0,action:"save",title,data:section==="media"?{title,type:"photo",url:result.url,image:result.url,album:"À classer",description:""}:{title,url:result.url,description:""}});count++;}onDone();}catch(e){setMessage(count+" fichier(s) enregistré(s). "+(e as Error).message);}finally{setBusy(false);}
 }
 return <div className="admin-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files);}}><b>{busy?"Import en cours…":"Glissez vos fichiers ici"}</b><p>Import multiple en brouillon</p><input aria-label="Importer plusieurs fichiers" type="file" multiple accept={section==="brochures"?"application/pdf":"image/jpeg,image/png,image/webp"} disabled={busy} onChange={e=>upload(e.target.files)} />{message&&<p role="status">{message}</p>}</div>;
}
function UserEditor({row,onSaved,onDirty}:{row:Entry<Document>;onSaved:()=>void;onDirty:(dirty:boolean)=>void}){
 const value=row.value as unknown as {email?:string;name?:string;role?:string;active?:boolean;demande?:boolean;cree_le?:string};
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);try{await request("/api/admin/content",{section:"users",key:row.key||String(data.email).trim().toLowerCase(),revision:row.revision,action:"save",data});onDirty(false);onSaved();}catch(e){setError((e as Error).message);setBusy(false);}}
 return <form className="admin-card" onSubmit={submit} onChange={()=>onDirty(true)}><h2>{row.revision?"Modifier le compte":"Créer un compte"}</h2>{value.demande&&<p className="admin-info admin-pending">Demande d’accès en attente{value.cree_le?" — reçue le "+new Date(value.cree_le).toLocaleString("fr-FR"):""}. Vérifiez qu’il s’agit bien d’un collaborateur, ajustez le rôle, puis passez « Compte actif » à « oui ».</p>}<fieldset disabled={busy}><label>Nom<input name="name" defaultValue={value.name||""} minLength={2} required /></label><label>E-mail<input name="email" type="email" defaultValue={value.email||""} readOnly={row.revision>0} required /></label><label>Rôle<select name="role" defaultValue={value.role||"editeur"}>{Object.entries(roleNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Compte actif<select name="active" defaultValue={value.active===false?"non":"oui"}><option value="oui">Oui</option><option value="non">Non</option></select></label><label>{row.revision?"Nouveau mot de passe (laisser vide pour conserver)":"Mot de passe"}<input type="password" name="password" minLength={12} maxLength={200} required={!row.revision} autoComplete="new-password" /></label><p className="admin-info">12 caractères minimum. Communiquez le mot de passe au collaborateur par votre canal habituel.</p><button className="admin-button">Enregistrer le compte</button></fieldset>{error&&<p className="admin-error" role="alert">{error}</p>}</form>;
}

function NewPageForm({existing,onCreate,onCancel}:{existing:string[];onCreate:(slug:string,title:string)=>void;onCancel:()=>void}){
 const [title,setTitle]=useState(""),[slug,setSlug]=useState(""),[error,setError]=useState("");
 return <form className="builder-new-page" onSubmit={e=>{e.preventDefault();if(!title.trim()){setError("Renseignez un titre.");return;}if(!validPageSlug(slug)){setError("Adresse réservée ou invalide : utilisez des lettres minuscules, chiffres et tirets.");return;}if(existing.includes("custom-"+slug)){setError("Cette adresse existe déjà, éventuellement dans la corbeille.");return;}onCreate(slug,title.trim());}}><h3>Nouvelle page</h3><label>Titre<input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} /></label><label>Adresse de la page<input required placeholder="notre-engagement" maxLength={70} value={slug} onChange={e=>setSlug(e.target.value.toLowerCase())} /></label><small>/{slug||"notre-engagement"} · L’adresse est définitive après enregistrement.</small>{error&&<p role="alert" className="admin-error">{error}</p>}<button className="admin-button" type="submit">Composer la page</button><button type="button" className="admin-button secondary" onClick={onCancel}>Annuler</button></form>;
}
