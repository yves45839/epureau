import { z } from "zod";
import { Resend } from "resend";
import { currentUser, sameOrigin } from "@/lib/auth";
import { may } from "@/content/admin-access";
import { entry, entries, save, Conflict } from "@/lib/admin-store";
import type { CustomerRequest } from "@/lib/admin-requests";
import { replyEmail } from "@/content/reply-email";
export const runtime="nodejs";
type Reply={requestKey:string;subject:string;message:string;to:string;from:string;replyTo:string;signature:string;actor:string;date:string;status:"pending"|"sent";providerId?:string};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const schema=z.object({requestKey:z.string().min(1).max(100),id:z.string().uuid(),subject:z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/),message:z.string().trim().min(2).max(12000)});
function config(){return Boolean(process.env.RESEND_API_KEY&&process.env.MAIL_FROM&&process.env.MAIL_REPLY_TO&&z.email().safeParse(process.env.MAIL_REPLY_TO).success);}
export async function GET(req:Request){
 const user=await currentUser();if(!user)return json({message:"Veuillez vous connecter."},401);
 if(!may(user.role,"requests"))return json({message:"Accès refusé."},403);
 try{const key=new URL(req.url).searchParams.get("requestKey");return json({configured:config(),replyTo:process.env.MAIL_REPLY_TO||"",replies:(await entries<Reply>("request-replies")).filter(r=>r.value.requestKey===key).map(r=>({...r,canRetry:r.value.status==="pending"&&r.value.actor===user.email&&Date.now()-Date.parse(r.value.date)<23*3600000}))});}catch{return json({message:"Historique indisponible."},503);}
}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({message:"Origine refusée."},403);
 const user=await currentUser();if(!user)return json({message:"Veuillez vous connecter."},401);
 if(!may(user.role,"requests"))return json({message:"Accès refusé."},403);
 try{
  const raw=await req.text();if(raw.length>20000)return json({message:"Message trop long."},413);
  let input;try{input=schema.safeParse(JSON.parse(raw));}catch{return json({message:"Données invalides."},422);}
  if(!input.success)return json({message:"Vérifiez l’objet et le message."},422);
  if(!config())return json({message:"L’envoi attend la configuration du domaine et du service e-mail."},503);
  const p=input.data, customer=await entry<CustomerRequest>("requests",p.requestKey);
  if(!customer||!z.email().safeParse(customer.value.email).success)return json({message:"Demande ou adresse client introuvable."},404);
  let record=await entry<Reply>("request-replies",p.id);
  if(record&&(record.value.requestKey!==p.requestKey||record.value.subject!==p.subject||record.value.message!==p.message||record.value.actor!==user.email))return json({message:"Cet envoi existe déjà avec un autre contenu."},409);
  if(record?.value.status==="sent")return json({ok:true});
  if(record&&Date.now()-Date.parse(record.value.date)>23*3600000)return json({message:"Envoi ancien à vérifier dans le journal Resend avant toute nouvelle tentative."},409);
  if(!record)record=await save<Reply>("request-replies",p.id,{requestKey:p.requestKey,subject:p.subject,message:p.message,to:customer.value.email,from:process.env.MAIL_FROM!,replyTo:process.env.MAIL_REPLY_TO!,signature:user.name,actor:user.email,date:new Date().toISOString(),status:"pending"},0);
  const d=record.value;
  const result=await new Resend(process.env.RESEND_API_KEY).emails.send({from:d.from,to:d.to,replyTo:d.replyTo,subject:d.subject,text:d.message+"\n\n"+d.signature+"\nEPUREAU Côte d’Ivoire",html:replyEmail(d.subject,d.message,d.signature)},{idempotencyKey:"reply/"+p.id});
  if(result.error||!result.data)return json({message:"Envoi non confirmé. Réessayez le même message ; la protection contre les doublons reste active."},502);
  await save("request-replies",p.id,{...d,status:"sent",providerId:result.data.id},record.revision);
  return json({ok:true});
 }catch(e){return json({message:e instanceof Conflict?"Envoi en cours ou déjà enregistré. Rechargez l’historique.":"Envoi non confirmé. Conservez le message et réessayez."},e instanceof Conflict?409:503);}
}
