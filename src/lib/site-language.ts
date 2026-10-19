import {seoMetadata} from "@/content/seo";
import {draftMode} from "next/headers";
import type {Metadata} from "next";
import {uiText} from "@/content/ui-english";
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
export const siteLanguage=cache(async():Promise<"fr"|"en">=>(await headers()).get("x-epureau-language")==="en"?"en":"fr");

export async function siteText(){const language=await siteLanguage();return (text:string)=>uiText(text,language);}
export async function localizedMetadata(metadata:Metadata):Promise<Metadata>{
 const language=await siteLanguage(),ui=await siteText();
 const path=(await headers()).get("x-epureau-path")||"/";
 const result=seoMetadata(path,language,{...metadata,title:typeof metadata.title==="string"?ui(metadata.title):metadata.title,description:metadata.description?ui(metadata.description):metadata.description});
 if((await draftMode()).isEnabled||process.env.VERCEL_ENV==="preview")result.robots={index:false,follow:false};
 return result;
}
