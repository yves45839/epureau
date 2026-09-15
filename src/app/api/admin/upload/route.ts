import { mkdir,writeFile } from "node:fs/promises";
import path from "node:path";
import { currentUser,sameOrigin } from "@/lib/auth";
import { may } from "@/lib/admin-security";
import { localStore } from "@/lib/admin-store";
export const runtime="nodejs";
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({message:"Origine refusée."},{status:403});
 const user=await currentUser();if(!user||!may(user.role,"media"))return Response.json({message:"Accès refusé."},{status:403});
 try{
 const form=await req.formData();const file=form.get("file");
 if(!(file instanceof File)||file.size>4*1024*1024||!file.size)return Response.json({message:"Fichier requis, de 4 Mo maximum."},{status:422});
 const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","application/pdf":"pdf"};
 const ext=types[file.type];if(!ext)return Response.json({message:"Formats autorisés : JPG, PNG, WebP et PDF."},{status:422});
 const buffer=Buffer.from(await file.arrayBuffer());
 const signature=ext==="jpg"?buffer[0]===255&&buffer[1]===216:ext==="png"?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):ext==="webp"?buffer.toString("ascii",0,4)==="RIFF"&&buffer.toString("ascii",8,12)==="WEBP":buffer.toString("ascii",0,5)==="%PDF-";
 if(!signature)return Response.json({message:"Le contenu ne correspond pas au format du fichier."},{status:422});
 const key=crypto.randomUUID()+"."+ext;
 if(localStore()){
  const dir=path.join(process.cwd(),".local","media");await mkdir(dir,{recursive:true});await writeFile(path.join(dir,key),buffer);
  return Response.json({url:"/api/media/"+key});
 }
 const origin=process.env.SUPABASE_URL;const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!origin||!secret)return Response.json({message:"Le stockage Supabase n’est pas encore connecté."},{status:503});
 const uploaded=await fetch(origin+"/storage/v1/object/site-media/"+key,{method:"POST",headers:{...(secret.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+secret}),apikey:secret,"Content-Type":file.type},body:buffer,signal:AbortSignal.timeout(20000)});
 if(!uploaded.ok)return Response.json({message:"Téléversement refusé. Vérifiez le stockage et son quota."},{status:502});
 return Response.json({url:origin+"/storage/v1/object/public/site-media/"+key});
 }catch{return Response.json({message:"Téléversement impossible pour le moment."},{status:503});}
}
