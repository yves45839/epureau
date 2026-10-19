import {z} from "zod";
import {revalidateTag} from "next/cache";
import {currentUser, sameOrigin} from "@/lib/auth";
import {may} from "@/content/admin-access";
import {editableDocuments} from "@/lib/cms";
import {Conflict, save, saveMany} from "@/lib/admin-store";

export const runtime="nodejs";
export const maxDuration=60;
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const schema=z.object({hidden:z.boolean(),items:z.array(z.object({key:z.string().min(1).max(100),revision:z.number().int().nonnegative()})).min(1).max(500)});

export async function POST(request:Request) {
  if(!sameOrigin(request))return json({message:"Origine refusée."},403);
  const user=await currentUser();
  if(!user)return json({message:"Veuillez vous connecter."},401);
  if(!may(user.role,"products"))return json({message:"Accès refusé."},403);
  try {
    const text=await request.text();
    if(text.length>100000)return json({message:"Sélection trop volumineuse."},413);
    const parsed=schema.safeParse(JSON.parse(text));
    if(!parsed.success)return json({message:"Sélection invalide."},422);
    const {items,hidden}=parsed.data;
    if(new Set(items.map(item=>item.key)).size!==items.length)return json({message:"Sélection en double."},422);
    const products=new Map((await editableDocuments("products")).map(row=>[row.key,row]));
    const changes=items.map(item=>{
      const row=products.get(item.key);
      if(!row||row.value.deleted||row.revision!==item.revision)throw new Conflict();
      return {key:row.key,revision:row.revision,value:{...row.value,hidden}};
    });
    const records=await saveMany("products",changes);
    revalidateTag("cms",{expire:0});
    try {await save("audit",crypto.randomUUID(),{actor:user.email,action:`Produits ${hidden?"masqués":"réaffichés"} : ${records.map(row=>row.key).join(", ")}`,date:new Date().toISOString()});}
    catch {console.error("[admin] Journal de visibilité indisponible");}
    return json({records});
  } catch(error) {
    if(error instanceof Conflict)return json({message:"La sélection a changé. Rechargez les produits avant de réessayer. Aucun produit n’a été modifié."},409);
    if(error instanceof SyntaxError)return json({message:"Format invalide."},422);
    return json({message:"Le changement de visibilité n’a pas pu être confirmé. Rechargez la liste."},503);
  }
}
