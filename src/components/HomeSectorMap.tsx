"use client";
import {useEffect,useRef,useState} from "react";
import {sectorMap,brochureUrl} from "@/content/sector-map";
import {safeBuilderUrl} from "@/content/page-builder";
import {useUi,useLanguage} from "./UiText";
import SectorCity from "./SectorCity";
import styles from "./HomeSectorMap.module.css";

export default function HomeSectorMap({content}:{content:Record<string,string>}){
  const ui=useUi();
  const root=useRef<HTMLElement>(null);
  const [paused,setPaused]=useState(false);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const element=root.current;
    if(!element)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.08});
    observer.observe(element);return ()=>observer.disconnect();
  },[]);
  const prefix="/"+useLanguage();
  const [selected,setSelected]=useState(0);
  const [documentOpen,setDocumentOpen]=useState(false);
  const value=(key:string,fallback:string)=>ui(content[key]??fallback);
  const sectors=sectorMap.map(s=>({...s,title:value(`map_${s.id}_title`,s.title),text:value(`map_${s.id}_text`,s.text),points:value(`map_${s.id}_points`,s.points),href:content[`map_${s.id}_link`]||s.href}));
  const active=sectors[selected];
  const href=safeBuilderUrl(active.href)?active.href:sectorMap[selected].href;
  return <section ref={root} className={styles.section} data-motion={visible&&!paused?"running":"paused"} id="secteurs" aria-labelledby="sector-map-title">
    <div className="shell">
      <div className={styles.heading}><div><span className="home-eyebrow">{ui("Nos solutions, vos secteurs")}</span><h2 id="sector-map-title">{value("map_title","À chaque environnement, sa solution.")}</h2></div><p>{value("map_intro","Explorez nos domaines d’intervention. Sélectionnez un lieu pour découvrir les solutions EPUREAU adaptées à votre activité.")}</p></div>
      <div className={styles.explorer}>
        <div className={styles.map}>
          <div className={styles.mapToolbar}><div className={styles.mapLegend}><span className={styles.dot}/>{ui("Une ville, six secteurs d’intervention")}</div><button className={styles.motionToggle} type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{ui(paused?"Activer les animations":"Mettre les animations en pause")}</button></div>
          <div className={styles.scene}>
            <SectorCity/>
            {sectors.map((sector,i)=><button type="button" className={`${styles.pin} ${i===selected?styles.active:""}`} key={sector.id} style={{left:`${sector.x/12}%`,top:`${sector.y/7}%`}} onClick={()=>setSelected(i)} aria-pressed={selected===i} aria-controls="sector-map-detail" aria-label={`${i+1}. ${sector.title}`}><span>{i+1}</span><b>{ui(sector.short)}</b></button>)}
          </div>
          <div className={styles.selector} aria-label={ui("Choisir un secteur")}>{sectors.map((sector,i)=><button type="button" key={sector.id} aria-pressed={selected===i} onClick={()=>setSelected(i)} aria-controls="sector-map-detail"><span>{String(i+1).padStart(2,"0")}</span>{sector.title}</button>)}</div>
          <p className={styles.caption}>{ui("Illustration de nos secteurs d’activité · cliquez sur un repère")}</p>
        </div>
        <article id="sector-map-detail" className={styles.detail} aria-live="polite" aria-atomic="true">
          <div className={styles.detailTop}><span>{String(selected+1).padStart(2,"0")} / 06</span><span>{ui("Solutions EPUREAU")}</span></div>
          <h3 key={active.id+"title"} className={styles.detailEnter}>{active.title}</h3><p key={active.id+"text"} className={styles.detailEnter}>{active.text}</p>
          <ul>{active.points.split("\n").filter(Boolean).map((point,i)=><li key={i}><span aria-hidden="true">✓</span>{point}</li>)}</ul>
          <a className={styles.primary} href={href.startsWith("/")&&!/^\/(fr|en)(\/|$)/.test(href)?prefix+href:href}>{ui("Découvrir nos solutions")} <span aria-hidden="true">↗</span></a>
          <a className={styles.contact} href={`${prefix}/contact?secteur=${encodeURIComponent(active.title)}#form`}>{ui("Parler de mon projet")} <span aria-hidden="true">→</span></a>
          <button type="button" className={styles.source} onClick={()=>setDocumentOpen(true)} aria-controls="sector-brochure" aria-expanded={documentOpen}>{ui("Retrouver ce secteur dans la plaquette")} · p. 2</button>
        </article>
      </div>
      <div className={styles.brochureBar}><div><strong>{ui("Toute notre expertise dans une plaquette")}</strong><p>{ui("Secteurs, services et accompagnement : découvrez EPUREAU Côte d’Ivoire.")}</p></div><div className={styles.brochureActions}><button type="button" onClick={()=>setDocumentOpen(!documentOpen)} aria-expanded={documentOpen} aria-controls="sector-brochure">{ui(documentOpen?"Fermer la plaquette":"Consulter la plaquette")} <span aria-hidden="true">{documentOpen?"−":"+"}</span></button><a href={brochureUrl} download="EPUREAU-plaquette.pdf">{ui("Télécharger le PDF")} ↓</a></div></div>
      <div id="sector-brochure" hidden={!documentOpen} className={styles.viewer}>{documentOpen&&<><p>{ui("Plaquette originale en français · 4 pages")} · <a href={brochureUrl} target="_blank" rel="noopener noreferrer">{ui("Ouvrir dans un nouvel onglet")} ↗</a></p><iframe src={`${brochureUrl}#page=2&view=FitH`} title={ui("Plaquette EPUREAU Côte d’Ivoire")} loading="lazy"/></>}</div>
    </div>
  </section>;
}
