import { requestOrigin } from "@/lib/auth";
import { publishedDocuments } from "@/lib/cms";
import { empreinte, estRobot, selDuJour, sourceDepuis, domaineReferent, appareilDepuis, navigateurDepuis, systemeDepuis, nomPays, enregistrer } from "@/lib/audience";
export const runtime="nodejs";
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;const doc=(await publishedDocuments("brochures")).find(d=>d.key===key);
 if(!doc?.data.url)return new Response("Document indisponible",{status:404});
 const agent=req.headers.get("user-agent")||"";
 if(!estRobot(agent))try{
  const hote=new URL(req.url).hostname;const referent=req.headers.get("referer")||"";
  const ip=(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"").split(",")[0].trim()||"inconnue";
  const lire=(nom:string)=>{try{return decodeURIComponent(req.headers.get(nom)||"").slice(0,80);}catch{return "";}};
  await enregistrer({visitor:empreinte(await selDuJour(),ip,agent),kind:"conversion",path:"/api/brochures/"+key,title:"Téléchargement : "+(doc.data.title||key),source:sourceDepuis(referent,hote),referrer:domaineReferent(referent,hote),pays:nomPays(lire("x-vercel-ip-country")),ville:lire("x-vercel-ip-city"),region:lire("x-vercel-ip-country-region"),appareil:appareilDepuis(agent),navigateur:navigateurDepuis(agent),systeme:systemeDepuis(agent),langue:""});
 }catch{/* la mesure ne bloque jamais le téléchargement */}
 return Response.redirect(new URL(doc.data.url,requestOrigin(req)),302);
}
