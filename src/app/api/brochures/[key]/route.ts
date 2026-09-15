import { requestOrigin } from "@/lib/auth";
import { publishedDocuments } from "@/lib/cms";
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;const doc=(await publishedDocuments("brochures")).find(d=>d.key===key);
 if(!doc?.data.url)return new Response("Document indisponible",{status:404});
 return Response.redirect(new URL(doc.data.url,requestOrigin(req)),302);
}
