import UiText from "./UiText";
import {Children,Fragment,isValidElement,type ReactNode} from "react";
import {pageLayout,type BuilderBlock} from "@/content/page-builder";
import BuilderCarousel from "./BuilderCarousel";

export function BuilderSectionView({block}:{block:BuilderBlock}){
 return <section className={`builder-section builder-${block.type} builder-theme-${block.theme}`} data-builder-id={block.id}>
  <div className="builder-wrap">
   {block.title&&<h2>{block.title}</h2>}{block.text&&<p className="builder-intro">{block.text}</p>}
   {block.image&&<img className="builder-main-image" src={block.image} alt={block.alt} width="1200" height="650" loading="lazy" />}
   {block.type==="carousel"?<BuilderCarousel block={block} />:block.type==="faq"?<div className="builder-faq">{block.items.map(item=><details key={item.id}><summary>{item.title}</summary><p>{item.text}</p></details>)}</div>:<div className="builder-items">{block.items.map(item=><article key={item.id}>{item.image&&<img src={item.image} alt={item.alt} width="700" height="450" loading="lazy" />}<h3>{item.title}</h3><p>{item.text}</p>{item.href&&<a href={item.href}><UiText text={"En savoir plus →"} /></a>}</article>)}</div>}
   {block.href&&<a className="builder-button" href={block.href}>{block.buttonLabel||"En savoir plus"} →</a>}
  </div>
 </section>;
}
function flatten(children:ReactNode):ReactNode[]{return Children.toArray(children).flatMap(child=>isValidElement<{children?:ReactNode}>(child)&&child.type===Fragment?flatten(child.props.children):[child]);}
export default function PageSections({page,values,children}:{page:string;values:Record<string,string>;children?:ReactNode}){
 const original=flatten(children);
 return <>{pageLayout(page,values).sections.map(section=><Fragment key={section.id}>{section.type==="builtin"?original[Number(section.source.slice(8))-1]:<BuilderSectionView block={section} />}</Fragment>)}</>;
}
