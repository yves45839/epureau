import {headers} from "next/headers";
import {company} from "@/lib/cms";
import {siteLanguage} from "@/lib/site-language";
import {SITE_URL,SITE_NAME,seoPages,localizedUrl,jsonLd} from "@/content/seo";

export default async function BusinessSchema(){
 const c=await company(),language=await siteLanguage(),path=(await headers()).get("x-epureau-path")||"/";
 const copy=seoPages[path]?.[language];
 const org={"@type":"LocalBusiness","@id":SITE_URL+"/#organization",name:c.nom,url:SITE_URL,logo:SITE_URL+"/images/logo.png",image:SITE_URL+"/images/proj-eurolait.jpg",email:c.email,telephone:c.telephoneLien,address:{"@type":"PostalAddress",streetAddress:c.adresse,addressLocality:"Abidjan",addressCountry:"CI"},areaServed:{"@type":"Country",name:"Côte d’Ivoire"}};
 const graph:object[]=[org,{"@type":"WebSite","@id":SITE_URL+"/#website",name:SITE_NAME,url:SITE_URL,inLanguage:["fr","en"],publisher:{"@id":org["@id"]}}];
 if(copy){
  graph.push({"@type":"WebPage","@id":localizedUrl(path,language)+"#webpage",url:localizedUrl(path,language),name:copy.title,description:copy.description,inLanguage:language,isPartOf:{"@id":SITE_URL+"/#website"},about:{"@id":org["@id"]}});
  if(path!=="/")graph.push({"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:language==="fr"?"Accueil":"Home",item:localizedUrl("/",language)},{"@type":"ListItem",position:2,name:copy.title,item:localizedUrl(path,language)}]});
  if(["/ingenierie/notre-expertise","/service-aux-industries","/hygiene-institutionnelle"].includes(path))graph.push({"@type":"Service",name:copy.title,description:copy.description,url:localizedUrl(path,language),provider:{"@id":org["@id"]},areaServed:{"@type":"Country",name:"Côte d’Ivoire"}});
 }
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@graph":graph})}}/>;
}
