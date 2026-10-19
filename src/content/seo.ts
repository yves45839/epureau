import type { Metadata } from "next";
export const SITE_URL="https://epureau-ci.com";
export const SITE_NAME="EPUREAU Côte d’Ivoire";
type Copy={title:string;description:string};
export const seoPages:Record<string,{fr:Copy;en:Copy}>={
 "/":{fr:{title:"Traitement des eaux en Côte d’Ivoire | EPUREAU",description:"EPUREAU à Abidjan : ingénierie de l’eau, stations d’épuration, traitement des eaux industrielles, hygiène professionnelle et produits NALCO et ECOLAB."},en:{title:"Water treatment in Côte d’Ivoire | EPUREAU",description:"EPUREAU in Abidjan: water engineering, wastewater treatment plants, industrial water treatment, professional hygiene and NALCO and ECOLAB products."}},
 "/a-propos":{fr:{title:"Entreprise de traitement des eaux à Abidjan",description:"Découvrez EPUREAU Côte d’Ivoire, entreprise d’ingénierie de l’eau basée à Cocody, Abidjan : équipe, expertise, valeurs et réalisations."},en:{title:"Water treatment company in Abidjan",description:"Meet EPUREAU Côte d’Ivoire, a water engineering company based in Cocody, Abidjan: our team, expertise, values and completed projects."}},
 "/ingenierie/notre-expertise":{fr:{title:"Traitement des eaux et stations d’épuration en Côte d’Ivoire",description:"Étude, conception, réalisation et exploitation de stations de traitement d’eau potable et d’eaux usées en Côte d’Ivoire. Contactez EPUREAU à Abidjan."},en:{title:"Water and wastewater treatment plants in Côte d’Ivoire",description:"Design, construction and operation of drinking water and wastewater treatment plants in Côte d’Ivoire. Contact EPUREAU in Abidjan about your project."}},
 "/ingenierie/nos-realisations":{fr:{title:"Nos stations de traitement des eaux en Côte d’Ivoire",description:"Découvrez les réalisations EPUREAU : stations d’épuration, procédés et capacités de traitement pour les établissements et industries en Côte d’Ivoire."},en:{title:"Our water treatment projects in Côte d’Ivoire",description:"Explore EPUREAU projects: wastewater treatment plants, processes and treatment capacities for institutions and industries in Côte d’Ivoire."}},
 "/service-aux-industries":{fr:{title:"Traitement des eaux industrielles en Côte d’Ivoire",description:"Solutions pour les eaux de chaudière, circuits de refroidissement et effluents industriels en Côte d’Ivoire. Expertise EPUREAU et produits NALCO et ECOLAB."},en:{title:"Industrial water treatment in Côte d’Ivoire",description:"Solutions for boiler water, cooling systems and industrial effluents in Côte d’Ivoire. EPUREAU expertise and NALCO and ECOLAB products."}},
 "/hygiene-institutionnelle":{fr:{title:"Hygiène professionnelle et institutionnelle en Côte d’Ivoire",description:"Hygiène des hôtels, hôpitaux, cuisines et buanderies en Côte d’Ivoire : produits, dosage et accompagnement technique par EPUREAU à Abidjan."},en:{title:"Professional and institutional hygiene in Côte d’Ivoire",description:"Hygiene for hotels, hospitals, kitchens and laundries in Côte d’Ivoire: products, dosing equipment and technical support from EPUREAU in Abidjan."}},
 "/negoce":{fr:{title:"Produits chimiques, NALCO et ECOLAB en Côte d’Ivoire",description:"Catalogue EPUREAU : produits de traitement de l’eau, nettoyage et désinfection, réactifs et matériel de mesure. Documentation et devis à Abidjan."},en:{title:"Chemicals, NALCO and ECOLAB products in Côte d’Ivoire",description:"EPUREAU catalogue: water treatment, cleaning and disinfection products, reagents and measuring equipment. Request documentation and a quote in Abidjan."}},
 "/contact":{fr:{title:"Contact et devis de traitement des eaux à Abidjan",description:"Contactez EPUREAU Côte d’Ivoire à Cocody, Abidjan pour un projet de traitement des eaux, une solution d’hygiène ou une demande de produits professionnels."},en:{title:"Contact and water treatment quotes in Abidjan",description:"Contact EPUREAU Côte d’Ivoire in Cocody, Abidjan for water treatment projects, hygiene solutions and professional product enquiries."}},
 "/blog":{fr:{title:"Actualités et expertise du traitement des eaux",description:"Actualités et conseils EPUREAU sur le traitement de l’eau, l’industrie et l’hygiène professionnelle en Côte d’Ivoire."},en:{title:"Water treatment news and expertise",description:"EPUREAU news and insights on water treatment, industry and professional hygiene in Côte d’Ivoire."}}
};
export function localizedUrl(path:string,language:"fr"|"en"){
 const clean=path.split(/[?#]/)[0].replace(/^\/(fr|en)(?=\/|$)/,"").replace(/\/+$/,"");
 return SITE_URL+"/"+language+(clean&&clean!=="/"?clean:"");
}
export function seoMetadata(path:string,language:"fr"|"en",metadata:Metadata={}):Metadata{
 const copy=seoPages[path]?.[language];
 const title=copy?.title??metadata.title;
 const description=copy?.description??metadata.description;
 const socialTitle=typeof title==="string"?title:SITE_NAME;
 const url=localizedUrl(path,language);
 const images=[{url:SITE_URL+"/images/proj-eurolait.jpg",alt:language==="fr"?"Station de traitement des eaux — EPUREAU Côte d’Ivoire":"Water treatment plant — EPUREAU Côte d’Ivoire"}];
 return {...metadata,title:typeof title==="string"?{absolute:path==="/"?title:title+" | EPUREAU"}:title,description,
  alternates:{canonical:url,languages:{fr:localizedUrl(path,"fr"),en:localizedUrl(path,"en"),"x-default":localizedUrl(path,"fr")}},
  openGraph:{type:"website",siteName:SITE_NAME,title:socialTitle,description:description??undefined,url,locale:language==="fr"?"fr_CI":"en_US",alternateLocale:language==="fr"?["en_US"]:["fr_CI"],images,...metadata.openGraph},
  twitter:{card:"summary_large_image",title:socialTitle,description:description??undefined,images:images.map(i=>i.url),...metadata.twitter}
 };
}
export const jsonLd=(data:unknown)=>JSON.stringify(data).replace(/</g,"\\u003c");
