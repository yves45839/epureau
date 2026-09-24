import {englishContent} from "@/content/translations";
import {siteLanguage} from "./site-language";
import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import definitions from "@/content/page-definitions.json";
import { realisations, galerie, videos, brochures, produits, societe, destinataires, reseaux } from "@/content/site";
import type { Document, ContentData, PageDefinition, Project, Media, Product } from "@/content/admin-types";
import { entries, entry, storeConfigured, type Entry } from "./admin-store";
import { currentUser } from "./auth";
import { may } from "./admin-security";
import { notFound } from "next/navigation";
import { customPagePath } from "@/content/page-builder";

export const pageDefinitions = definitions as PageDefinition[];
export const sectionNames: Record<string,string> = { dashboard:"Vue d’ensemble",requests:"Demandes & réclamations",pages:"Pages du site",projects:"Réalisations",products:"Produits",media:"Médiathèque",brochures:"Brochures",blog:"Blog",settings:"Paramètres",users:"Utilisateurs",audience:"Audience",audit:"Journal des accès" };
export const modelFields: Record<string, { key:string; label:string; type?:string }[]> = {
 projects:[{key:"nom",label:"Nom du projet"},{key:"client",label:"Client et localisation"},{key:"type",label:"Procédé"},{key:"debit",label:"Capacité"},{key:"unite",label:"Unité"},{key:"image",label:"Photo",type:"image"},{key:"texte",label:"Description",type:"long"}],
 products:[{key:"nom",label:"Nom du produit"},{key:"marque",label:"Marque",type:"brand"},{key:"gamme",label:"Gamme ou famille"},{key:"usage",label:"Application principale",type:"long"},{key:"secteurs",label:"Secteurs concernés"},{key:"forme",label:"Forme et conditionnement"},{key:"points",label:"Points clés (un par ligne)",type:"long"},{key:"image",label:"Visuel",type:"image"},{key:"texte",label:"Description",type:"long"}],
 media:[{key:"title",label:"Titre / légende"},{key:"type",label:"Type (photo ou video)",type:"mediaType"},{key:"url",label:"Fichier ou lien vidéo",type:"url"},{key:"image",label:"Image d’aperçu",type:"image"},{key:"album",label:"Album"},{key:"description",label:"Description",type:"long"}],
 brochures:[{key:"title",label:"Titre"},{key:"url",label:"Fichier PDF",type:"url"},{key:"description",label:"Description",type:"long"}],
 blog:[{key:"title",label:"Titre"},{key:"image",label:"Image",type:"image"},{key:"description",label:"Résumé",type:"long"},{key:"text",label:"Article",type:"long"}],
 settings:[...Object.keys(societe).map(key=>({key,label:({nom:"Nom de la société",telephone:"Téléphone affiché",telephoneLien:"Téléphone pour les liens",email:"E-mail de contact",adresse:"Adresse",horaires:"Horaires courts",horairesLong:"Horaires",boitePostale:"Boîte postale",maps:"Lien Google Maps",groupe:"Groupe",site:"Site",slogan:"Slogan"} as Record<string,string>)[key]})),{key:"notificationEmails",label:"Adresses de notification (séparées par des virgules)"},{key:"linkedin",label:"Lien LinkedIn"},{key:"facebook",label:"Lien Facebook"},{key:"youtube",label:"Lien YouTube"},{key:"legal",label:"Mentions légales",type:"long"},{key:"privacy",label:"Politique de confidentialité",type:"long"},{key:"blogEnabled",label:"Blog actif (oui ou non)"}],
};
function document(key:string,title:string,data:ContentData,order:number):Entry<Document> { return {key,value:{title,draft:data,published:data,order},revision:0,updated:""}; }
export function seeds(section:string):Entry<Document>[] {
 if(section==="pages")return pageDefinitions.map((page,i)=>document(page.key,page.title,Object.fromEntries(page.fields.map(f=>[f.key,f.value])),i));
 if(section==="projects")return realisations.map((r,i)=>document(r.slug,r.nom,{nom:r.nom,client:r.client,type:r.type,debit:r.debit,unite:r.unite,image:r.image,texte:r.texte},i));
 if(section==="products")return produits.map((p,i)=>document(p.slug,p.nom,{nom:p.nom,marque:p.marque,gamme:p.gamme,usage:p.usage,secteurs:p.secteurs,forme:p.forme,points:p.points,image:p.image,texte:p.texte},i));
 if(section==="media")return [
  ...galerie.map((g,i)=>document("photo-"+(i+1),g.legende,{title:g.legende,type:"photo",url:g.image,image:g.image,album:"Chantiers",description:""},i)),
  ...videos.map((v,i)=>document("video-"+(i+1),v.titre,{title:v.titre,type:"video",url:"",image:v.vignette,album:"Vidéos",description:v.sous},i+galerie.length)),
 ];
 if(section==="brochures")return brochures.map((b,i)=>document("brochure-"+(i+1),b.titre,{title:b.titre,url:b.fichier,description:b.sous},i));
 if(section==="settings")return [document("societe","Paramètres du site",{...societe,notificationEmails:destinataires.join(", "),...reseaux,legal:"",privacy:"",blogEnabled:"non"},0)];
 return [];
}
export async function editableDocuments(section:string) {
 const saved=await entries<Document>(section);
 const map=new Map(seeds(section).map(doc=>[doc.key,doc]));
 saved.forEach(doc=>map.set(doc.key,doc));
 return [...map.values()].sort((a,b)=>a.value.order-b.value.order);
}
const cachedDocuments=unstable_cache(editableDocuments,["epureau-content-v1"],{tags:["cms"],revalidate:300});
const canPreview=cache(async(section:string)=>{
 if(!storeConfigured() || !(await draftMode()).isEnabled)return false;
 const user=await currentUser();return Boolean(user&&may(user.role,section));
});
export async function publishedDocuments(section:string,allowPreview=true):Promise<{key:string;data:ContentData}[]> {
 let docs:Entry<Document>[];
 try { docs=storeConfigured()?await cachedDocuments(section):seeds(section); }
 catch { console.error("[cms] Lecture indisponible");docs=seeds(section); }
 const preview=allowPreview&&await canPreview(section);
 if(preview)docs=await editableDocuments(section);
 const language=await siteLanguage();
 return docs.filter(doc=>!doc.value.deleted && (preview||doc.value.published)).map(doc=>({key:doc.key,data:language==="en"?englishContent(preview?doc.value.draft:doc.value.published!):preview?doc.value.draft:doc.value.published!}));
}
export const pageValues=cache(async(key:string):Promise<ContentData>=>{
 const fallback=seeds("pages").find(doc=>doc.key===key)?.value.draft??{};
 const doc=(await publishedDocuments("pages")).find(doc=>doc.key===key);
 if(!doc)notFound();
 return {...fallback,...doc.data};
});
export const customPageFields=[{key:"title",label:"Titre de la page",type:"text" as const,value:""},{key:"description",label:"Description pour les moteurs de recherche",type:"long" as const,value:""}];
export async function editablePageDefinitions():Promise<PageDefinition[]> {
 return [...pageDefinitions,...(await editableDocuments("pages")).filter(d=>customPagePath(d.key)).map(d=>({key:d.key,title:d.value.title,path:customPagePath(d.key)!,fields:customPageFields}))];
}
export const company=cache(async()=>{
 const data=(await publishedDocuments("settings"))[0]?.data;
 return Object.fromEntries(Object.entries(societe).map(([key,value])=>[key,data?.[key]??value])) as typeof societe;
});
export async function notificationEmails() {
 // Notification routing is never read from drafts.
 const doc=await entry<Document>("settings","societe");
 return (doc?.value.published?.notificationEmails??destinataires.join(",")).split(",").map(v=>v.trim()).filter(Boolean);
}
export const projectList=cache(async():Promise<Project[]> => (await publishedDocuments("projects")).map(({key,data})=>({...data,slug:key}) as Project));
export const productList=cache(async():Promise<Product[]> => (await publishedDocuments("products")).map(({key,data})=>({...data,slug:key}) as unknown as Product));
export const mediaList=cache(async():Promise<Media[]> => (await publishedDocuments("media")).map(({key,data})=>({...data,id:key}) as Media));
