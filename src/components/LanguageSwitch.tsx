import { headers } from "next/headers";
import { siteLanguage } from "@/lib/site-language";
export default async function LanguageSwitch(){
 const language=await siteLanguage();
 const path=(await headers()).get("x-epureau-path")||"/";
 const suffix=path==="/"?"":path;
 return <nav className="site-languages" aria-label={language==="en"?"Language":"Langue"}>
   <a href={"/fr"+suffix} hrefLang="fr" lang="fr" aria-current={language==="fr"?"page":undefined}>FR<span className="language-name"> · Français</span></a>
   <a href={"/en"+suffix} hrefLang="en" lang="en" aria-current={language==="en"?"page":undefined}>EN<span className="language-name"> · English</span></a>
 </nav>;
}
