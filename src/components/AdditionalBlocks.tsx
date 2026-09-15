import { pageValues } from "@/lib/cms";
export default async function AdditionalBlocks({page}:{page:string}){
 const values=await pageValues(page);
 const blocks: {title:string;text:string;image:string}[]=JSON.parse(values.__blocks||"[]");
 if(!blocks.length)return null;
 return <section className="sec"><div className="wrap cms-blocks">{blocks.map((block,index)=><article key={index}>{block.image&&<img src={block.image} alt="" width="960" height="540" loading="lazy" />}<h2>{block.title}</h2><p style={{whiteSpace:"pre-line"}}>{block.text}</p></article>)}</div></section>;
}
