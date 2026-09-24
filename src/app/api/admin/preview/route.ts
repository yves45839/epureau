import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { currentUser, requestOrigin } from "@/lib/auth";
import { may } from "@/lib/admin-security";
import { editablePageDefinitions, editableDocuments } from "@/lib/cms";
export async function GET(req:Request) {
 const url=new URL(req.url);
 if(url.searchParams.get("exit")==="1"){(await draftMode()).disable();return NextResponse.redirect(new URL("/admin",requestOrigin(req)));}
 const user=await currentUser();if(!user||!may(user.role,"pages"))return new Response("Accès refusé",{status:403});
 const target=url.searchParams.get("path")||"/";
 const allowed=[...(await editablePageDefinitions()).map(p=>p.path),"/blog","/mentions-legales","/confidentialite"];
 allowed.push(...(await editableDocuments("products")).filter(p=>!p.value.deleted).map(p=>"/negoce/"+encodeURIComponent(p.key)));
 if(!allowed.includes(target))return new Response("Page inconnue",{status:400});
 (await draftMode()).enable();return NextResponse.redirect(new URL((url.searchParams.get("lang")==="en"?"/en":"/fr")+(target==="/"?"":target),requestOrigin(req)));
}
