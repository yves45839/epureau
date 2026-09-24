import {z} from "zod";
import {sameOrigin} from "@/lib/auth";
import {publishedDocuments} from "@/lib/cms";
import {recordRequest} from "@/lib/admin-requests";
import {validProductDocument} from "@/content/product-catalog";

export const runtime="nodejs";
const schema=z.object({email:z.string().trim().email().max(160),site:z.string().max(1000).optional().default("")});
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export async function POST(req:Request,{params}:{params:Promise<{slug:string}>}) {
  if(!sameOrigin(req))return json({message:"Requête non autorisée."},403);
  let data:z.infer<typeof schema>;
  try {
    const text=await req.text();
    if(text.length>4000)return json({message:"Requête trop longue."},413);
    const parsed=schema.safeParse(JSON.parse(text));
    if(!parsed.success)return json({message:"Veuillez saisir une adresse e-mail valide."},422);
    data=parsed.data;
  }catch{return json({message:"Requête invalide."},400);}
  if(data.site)return json({message:"Requête non autorisée."},422);
  try {
    const {slug}=await params;
    // Never unlock a draft, even for an authenticated administrator in preview.
    const product=(await publishedDocuments("products",false)).find(p=>p.key===slug)?.data;
    if(!product)return json({message:"Produit indisponible."},404);
    const url=product.fiche&&validProductDocument(product.fiche)?product.fiche:"";
    const saved=await recordRequest({nom:"",societe:"",telephone:"",email:data.email,
      objet:`Fiche technique — ${product.nom}`,source:"fiche-produit",
      besoin:`Produit : ${product.nom}\nRéférence : ${product.reference||slug}\nMarque : ${product.marque}\n${url ? "Accès au document : "+(product.documentType||"Fiche technique") : "Fiche technique à transmettre au demandeur."}${product.documentType==="Brochure fabricant"?"\nFiche technique complémentaire à transmettre au demandeur.":""}`});
    if(!saved)return json({message:"Enregistrement indisponible. Réessayez dans un instant."},503);
    return json({ok:true,url});
  }catch{return json({message:"Enregistrement indisponible. Réessayez dans un instant."},503);}
}
