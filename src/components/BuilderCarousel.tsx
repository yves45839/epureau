"use client";
import {useEffect,useRef,useState} from "react";
import type {BuilderBlock} from "@/content/page-builder";
export default function BuilderCarousel({block}:{block:BuilderBlock}){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!playing||hover||focused||block.items.length<2)return;
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer:ReturnType<typeof setInterval>|undefined,inView=false;
  const sync=()=>{clearInterval(timer);if(inView&&!document.hidden&&!motion.matches)timer=setInterval(()=>setIndex(i=>(i+1)%block.items.length),5000);};
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();});
  if(root.current)observer.observe(root.current);
  document.addEventListener("visibilitychange",sync);motion.addEventListener("change",sync);
  return()=>{clearInterval(timer);observer.disconnect();document.removeEventListener("visibilitychange",sync);motion.removeEventListener("change",sync);};
 },[playing,hover,focused,block.items.length]);
 const active=Math.min(index,Math.max(0,block.items.length-1));
 const move=(step:number)=>{setPlaying(false);setIndex((active+step+block.items.length)%block.items.length);};
 return <div className="builder-carousel" ref={root} role="region" aria-roledescription="carrousel" aria-label={block.title||"Galerie"} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={e=>setFocused(!e.target.closest(".builder-carousel-controls"))} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}>
  {block.items.map((item,i)=><figure key={item.id} hidden={i!==active} role="group" aria-roledescription="diapositive" aria-label={`${i+1} sur ${block.items.length}`}>
   {item.image&&<img src={item.image} alt={item.alt} width="1200" height="650" loading="lazy" />}<figcaption><h3>{item.title}</h3><p>{item.text}</p>{item.href&&<a href={item.href}>En savoir plus →</a>}</figcaption>
  </figure>)}
  {block.items.length>1&&<div className="builder-carousel-controls"><button type="button" aria-label="Diapositive précédente" onClick={()=>move(-1)}>←</button><span aria-live={playing?"off":"polite"}>{active+1} / {block.items.length}</span><button type="button" onClick={()=>setPlaying(v=>!v)}>{playing?"Pause":"Lecture automatique"}</button><button type="button" aria-label="Diapositive suivante" onClick={()=>move(1)}>→</button></div>}
 </div>;
}
