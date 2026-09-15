import { readFile } from "node:fs/promises";
import path from "node:path";
import { localStore } from "@/lib/admin-store";
export const runtime="nodejs";
export async function GET(_req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;
 if(!localStore()||! /^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(key))return new Response("Introuvable",{status:404});
 try{
 const buffer=await readFile(path.join(process.cwd(),".local","media",key));
 const type:Record<string,string>={jpg:"image/jpeg",png:"image/png",webp:"image/webp",pdf:"application/pdf"};
 return new Response(buffer,{headers:{"Content-Type":type[key.split(".").pop()!],"X-Content-Type-Options":"nosniff","Cache-Control":"public,max-age=86400","Content-Security-Policy":"sandbox"}});
 }catch{return new Response("Introuvable",{status:404});}
}
