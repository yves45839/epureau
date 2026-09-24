import { z } from "zod";
import catalog from "./page-sections.json";

export const sectionCatalog = catalog as Record<string, {id:string;label:string;fields:string[]}[]>;
export const blockNames = {text:"Texte et image",image:"Grande image",cta:"Appel à l’action",cards:"Cartes",gallery:"Galerie",carousel:"Carrousel",faq:"Questions fréquentes"} as const;
export type BlockType = keyof typeof blockNames;
export function safeBuilderUrl(value:string) {
  if (!value) return true;
  if (/[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  try {const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password;} catch {return false;}
}
const short=z.string().max(200);
const link=z.string().max(2000).refine(safeBuilderUrl,"Utilisez une adresse HTTPS ou un chemin du site.");
const item=z.object({id:z.string().min(1).max(80),title:short,text:z.string().max(5000),image:link,alt:short,href:link}).strict();
const block=z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),type:z.enum(["text","image","cta","cards","gallery","carousel","faq"]),title:short,text:z.string().max(10000),image:link,alt:short,href:link,buttonLabel:short,theme:z.enum(["light","soft","dark"]),items:z.array(item).max(20)}).strict();
const builtin=z.object({id:z.string().max(80),type:z.literal("builtin"),source:z.string().max(80)}).strict();
export const layoutSchema=z.object({version:z.literal(1),sections:z.array(z.discriminatedUnion("type",[builtin,block])).max(40)}).strict().superRefine((layout,ctx)=>{
 const ids=layout.sections.map(s=>s.id),sources=layout.sections.filter(s=>s.type==="builtin").map(s=>s.source);
 if(new Set(ids).size!==ids.length||new Set(sources).size!==sources.length)ctx.addIssue({code:"custom",message:"Chaque section doit avoir un identifiant unique."});
 for(const section of layout.sections)if(section.type!=="builtin"&&new Set(section.items.map(i=>i.id)).size!==section.items.length)ctx.addIssue({code:"custom",message:"Les éléments doivent être uniques."});
});
export type BuilderBlock=z.infer<typeof block>;
export type BuilderSection=z.infer<typeof layoutSchema>["sections"][number];
export type PageLayout=z.infer<typeof layoutSchema>;
export function emptyBlock(type:BlockType,id:string):BuilderBlock {return {id,type,title:blockNames[type],text:"",image:"",alt:"",href:"",buttonLabel:"En savoir plus",theme:"light",items:[]};}
export function pageLayout(page:string,data:Record<string,string>):PageLayout {
 if(data.__layout){try{const result=layoutSchema.safeParse(JSON.parse(data.__layout));if(result.success)return result.data;}catch{}}
 const sections:BuilderSection[]=(sectionCatalog[page]||[]).map(s=>({id:s.id,type:"builtin",source:s.id}));
 try{const legacy=JSON.parse(data.__blocks||"[]") as {title:string;text:string;image:string}[];legacy.forEach((b,i)=>sections.push({...emptyBlock("text","legacy-"+i),...b}));}catch{}
 return {version:1,sections};
}
export function validatePageLayout(page:string,text:string) {
 const layout=layoutSchema.parse(JSON.parse(text));
 const allowed=new Set((sectionCatalog[page]||[]).map(s=>s.id));
 if(layout.sections.some(s=>s.type==="builtin"&&!allowed.has(s.source)))throw new Error("Section d’origine inconnue.");
 return layout;
}
const reserved=new Set(["fr","en","admin","api","blog","ingenierie","images","maquette","fonts","_next","favicon","robots","sitemap","mentions-legales","confidentialite",...Object.keys(sectionCatalog)]);
export function validPageSlug(slug:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)&&slug.length<=70&&!reserved.has(slug);}
export function customPagePath(key:string){return key.startsWith("custom-")&&validPageSlug(key.slice(7))?"/"+key.slice(7):undefined;}
