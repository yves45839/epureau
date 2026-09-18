import { revalidateTag } from "next/cache";
import { z } from "zod";
import { currentUser, sameOrigin } from "@/lib/auth";
import { may, hashPassword, roles, safePublicUrl, emailAutorise, estSuperAdmin, type Account, csvCell } from "@/lib/admin-security";
import { rapport } from "@/lib/audience";
import { buildOverview } from "@/lib/admin-overview";
import { entries, entry, save, remove, Conflict } from "@/lib/admin-store";
import { editableDocuments, editablePageDefinitions, customPageFields, modelFields, pageDefinitions, sectionNames } from "@/lib/cms";
import {customPagePath,validatePageLayout} from "@/content/page-builder";
import {marqueValide} from "@/content/products";
import { requestList, type CustomerRequest } from "@/lib/admin-requests";
import type { Document } from "@/content/admin-types";
export const runtime="nodejs";
const sections=Object.keys(sectionNames);
const response=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
async function audit(actor:string,action:string){ await save("audit",crypto.randomUUID(),{actor,action,date:new Date().toISOString()}); }
export async function GET(req:Request) {
 try{
 const user=await currentUser();if(!user)return response({message:"Veuillez vous connecter."},401);
 const url=new URL(req.url);const section=url.searchParams.get("section")||"dashboard";
 if(!sections.includes(section)||!may(user.role,section))return response({message:"Accès refusé."},403);
 if(section==="requests"||section==="dashboard"){
  const data=may(user.role,"requests")?await requestList():[];
  if(url.searchParams.get("format")==="csv"&&section==="requests"){
   const rows=data.filter(row=>{const d=row.value;return (!url.searchParams.get("status")||d.statut===url.searchParams.get("status"))&&(!url.searchParams.get("month")||d.cree_le.startsWith(url.searchParams.get("month")!));});
   const text="\uFEFF"+[["Référence","Date","Type","Société","Nom","E-mail","Téléphone","Objet","Description","Statut","Affectation"],...rows.map(({key,value:d})=>[key,d.cree_le,d.source,d.societe,d.nom,d.email,d.telephone,d.objet,d.besoin,d.statut,d.assigned])].map(row=>row.map(csvCell).join(";")).join("\r\n");
   return new Response(text,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="demandes.csv"',"Cache-Control":"no-store"}});
  }
  const team=(await entries<Account>("users")).filter(r=>r.value.active).map(r=>({id:r.key,name:r.value.name}));
  return response({user,data,team,overview:section==="dashboard"?await buildOverview(user):undefined});
 }
 if(section==="users")return response({user,data:(await entries<Account>("users")).map(r=>({...r,value:{...r.value,password:undefined}}))});
 if(section==="audience")return response({user,data:[],audience:await rapport(Number(url.searchParams.get("jours"))||30)});
 if(section==="audit")return response({user,data:(await entries("audit")).sort((a,b)=>b.updated.localeCompare(a.updated)).slice(0,300)});
 return response({user,data:await editableDocuments(section),fields:modelFields[section]||[],pages:section==="pages"?await editablePageDefinitions():undefined});
 }catch{return response({message:"Lecture indisponible. Vérifiez la connexion au stockage."},503);}
}
const payloadSchema=z.object({section:z.string(),key:z.string().min(1).max(100).regex(/^[a-zA-Z0-9@._-]+$/),action:z.enum(["save","publish","unpublish","delete","restore"]),revision:z.number().int().nonnegative(),title:z.string().trim().max(200).optional(),order:z.number().int().min(0).max(9999).optional(),data:z.record(z.string().max(80),z.string().max(180000)).optional()});
export async function POST(req:Request){
 if(!sameOrigin(req))return response({message:"Origine refusée."},403);
 try {
 const user=await currentUser();if(!user)return response({message:"Veuillez vous connecter."},401);
 const text=await req.text();if(text.length>300000)return response({message:"Contenu trop volumineux."},413);
 const parsed=payloadSchema.safeParse(JSON.parse(text));if(!parsed.success)return response({message:"Données invalides."},422);
 const p=parsed.data;
 if(!sections.includes(p.section)||!may(user.role,p.section)||["dashboard","audit"].includes(p.section))return response({message:"Accès refusé."},403);
 if(p.section==="requests"){
  if(p.action!=="save")return response({message:"Action indisponible."},422);
  const old=await entry<CustomerRequest>("requests",p.key);if(!old)return response({message:"Demande introuvable."},404);
  const data=p.data||{};
  if(!["nouvelle","en_cours","traitee"].includes(data.statut))return response({message:"Statut invalide."},422);
  if(data.assigned&&!(await entry<Account>("users",data.assigned))?.value.active)return response({message:"Collaborateur indisponible."},422);
  const changes=[old.value.statut!==data.statut?"Statut : "+data.statut:"",old.value.assigned!==data.assigned?"Affectation : "+(data.assigned||"aucune"):"",data.note||""].filter(Boolean).join(" · ");
  const result=await save("requests",p.key,{...old.value,statut:data.statut,assigned:data.assigned||"",history:[...old.value.history,...(changes?[{date:new Date().toISOString(),actor:user.name,message:changes}]:[])]},p.revision);
  await audit(user.email,"Mise à jour de la demande "+p.key);return response({record:result});
 }
 if(p.section==="users"){
  const data=p.data||{};const old=await entry<Account>("users",p.key);
  const parsedUser=z.object({email:z.email().max(160),name:z.string().trim().min(2).max(120),role:z.enum(roles),active:z.enum(["oui","non"]),password:z.string().max(200)}).safeParse(data);
  if(p.action!=="save"||!parsedUser.success)return response({message:"Renseignez les champs du compte."},422);
  const u=parsedUser.data;
  if(p.key!==u.email.toLowerCase()||p.key===(process.env.ADMIN_EMAIL||"admin@epureau-ci.com").toLowerCase())return response({message:"Cette adresse est réservée ou ne correspond pas au compte."},422);
  if(!emailAutorise(u.email))return response({message:"Adresse non autorisée : utilisez une adresse @epureau-ci.com."},422);
  if(estSuperAdmin(p.key)&&!estSuperAdmin(user.email))return response({message:"Ce compte appartient au super administrateur du site."},422);
  if(user.id===p.key&&(u.role!==user.role||u.active!=="oui"))return response({message:"Vous ne pouvez pas retirer vos propres droits."},422);
  if((!old||u.password)&&u.password.length<12)return response({message:"Choisissez un mot de passe d’au moins 12 caractères."},422);
  const result=await save("users",p.key,{...old?.value,email:u.email.toLowerCase(),name:u.name,role:u.role,active:u.active==="oui",password:u.password?await hashPassword(u.password):old!.value.password,demande:u.active==="oui"?false:old?.value.demande??false},p.revision);
  if(u.password)for(const session of await entries<{user:string}>("sessions"))if(session.value.user===p.key)await remove("sessions",session.key);
  await audit(user.email,"Compte mis à jour : "+p.key);return response({record:{...result,value:{...result.value,password:undefined}}});
 }
 const old=(await editableDocuments(p.section)).find(r=>r.key===p.key);
 if((old?.revision??0)!==p.revision)throw new Conflict();
 const builtIn=pageDefinitions.find(page=>page.key===p.key);
 const customPage=p.section==="pages"&&Boolean(customPagePath(p.key));
 if(p.section==="pages"&&!builtIn&&!customPage)return response({message:"Adresse de page invalide ou réservée."},422);
 if(p.section==="settings"&&p.key!=="societe")return response({message:"Paramètre inconnu."},422);
 const fields=p.section==="pages"?(builtIn?.fields||customPageFields):modelFields[p.section]||[];
 const allowed=new Set([...fields.map(f=>f.key),"__blocks",...(p.section==="pages"?["__layout","__navigation"]:[])]);
 const data=p.data??old?.value.draft??{};
 if(Object.keys(data).some(key=>!allowed.has(key)))return response({message:"Champ inconnu."},422);
 if(Object.entries(data).some(([key,value])=>key!=="__layout"&&value.length>24000))return response({message:"Champ trop long."},422);
 if(p.section==="pages"){
  if(data.__navigation&&!['oui','non'].includes(data.__navigation))return response({message:"Option de navigation invalide."},422);
  if(data.__layout){try{validatePageLayout(p.key,data.__layout);}catch{return response({message:"Composition invalide : vérifiez les sections, les liens et leurs limites."},422);}}
  if(customPage&&(!data.title?.trim()||!data.__layout))return response({message:"Renseignez le titre et la composition de la page."},422);
 }
 for(const field of fields)if(["image","url"].includes(field.type||"")&&data[field.key]&&!safePublicUrl(data[field.key]))return response({message:"Utilisez un fichier du site ou un lien HTTPS pour "+field.label+"."},422);
 if(p.section==="media"&&!["photo","video"].includes(data.type))return response({message:"Choisissez photo ou video."},422);
 if(p.section==="products"){
  if(!data.nom?.trim())return response({message:"Renseignez le nom du produit."},422);
  if(!marqueValide(data.marque))return response({message:"Choisissez une marque parmi celles proposées."},422);
 }
 if(data.__blocks){
  const blocks=z.array(z.object({title:z.string().max(200),text:z.string().max(10000),image:z.string().max(2000).refine(v=>!v||safePublicUrl(v))})).max(20).safeParse(JSON.parse(data.__blocks));
  if(!blocks.success)return response({message:"Les blocs sont invalides."},422);
 }
 if(p.section==="settings"){
  if(!z.email().safeParse(data.email).success||!data.notificationEmails?.split(",").every(e=>z.email().safeParse(e.trim()).success))return response({message:"Vérifiez les adresses e-mail."},422);
  for(const k of ["maps","linkedin","facebook","youtube"])if(data[k]&&!/^https:\/\//.test(data[k]))return response({message:"Les liens doivent utiliser HTTPS."},422);
  if(!["oui","non"].includes(data.blogEnabled))return response({message:"Le réglage Blog doit être oui ou non."},422);
 }
 if((p.section==="settings"||(p.section==="pages"&&!customPage))&&["delete","unpublish"].includes(p.action))return response({message:"Cette page principale reste disponible. Vous pouvez modifier ou retirer ses sections."},422);
 if(p.action==="restore"&&(!customPage||!old?.value.deleted))return response({message:"Cette page n’est pas dans la corbeille."},422);
 const doc:Document={title:p.title||old?.value.title||data.nom||data.title||p.key,draft:data,published:old?.value.published??null,order:p.order??old?.value.order??999};
 if(p.action==="publish")doc.published=data;
 if(p.action==="unpublish")doc.published=null;
 if(p.action==="delete")doc.deleted=true;
 if(p.action==="restore")doc.published=null;
 const result=await save(p.section,p.key,doc,p.revision);
 revalidateTag("cms",{expire:0});await audit(user.email,p.action+" : "+p.section+"/"+p.key);
 return response({record:result});
 }catch(error){
  if(error instanceof Conflict)return response({message:error.message},409);
  if(error instanceof SyntaxError)return response({message:"Format invalide."},400);
  console.error("[admin] Modification impossible");return response({message:"Enregistrement indisponible. Vos modifications n’ont pas été confirmées."},503);
 }
}
