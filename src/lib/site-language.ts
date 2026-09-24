import type {Metadata} from "next";
import {uiText} from "@/content/ui-english";
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
export const siteLanguage=cache(async():Promise<"fr"|"en">=>(await headers()).get("x-epureau-language")==="en"?"en":"fr");

export async function siteText(){const language=await siteLanguage();return (text:string)=>uiText(text,language);}
export async function localizedMetadata(metadata:Metadata):Promise<Metadata>{const ui=await siteText();return {...metadata,title:typeof metadata.title==="string"?ui(metadata.title):metadata.title,description:metadata.description?ui(metadata.description):metadata.description};}
