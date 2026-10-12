import { headers } from "next/headers";
import { siteLanguage } from "@/lib/site-language";
export default async function LanguageSwitch(){
 const language=await siteLanguage();
 const path=(await headers()).get("x-epureau-path")||"/";
 const suffix=path==="/"?"":path;
 return <nav className="site-languages" aria-label={language==="en"?"Language":"Langue"}>
   <a href={"/fr"+suffix} hrefLang="fr" lang="fr" aria-label="Français" title="Français" aria-current={language==="fr"?"page":undefined}>FR</a>
   <span aria-hidden="true">/</span>
   <a href={"/en"+suffix} hrefLang="en" lang="en" aria-label="English" title="English" aria-current={language==="en"?"page":undefined}>EN</a>
 </nav>;
}
