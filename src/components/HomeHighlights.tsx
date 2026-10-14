"use client";
import type {Media} from "@/content/admin-types";
import type {Announcement} from "@/content/home-highlights";
import {useLanguage} from "./UiText";
import MediaVideo from "./MediaVideo";
import Icon from "./Icon";
import styles from "./HomeHighlights.module.css";

export default function HomeHighlights({announcements,video}:{announcements:Announcement[];video?:Media}) {
  const language=useLanguage(), english=language==="en";
  if (!announcements.length && !video) return null;
  const categories:Record<string,string>={"Actualité":"News","Recrutement":"Careers","Événement":"Event"};
  const localLink=(url:string)=>url.startsWith("/")&&!/^\/(fr|en)(\/|$)/.test(url)?`/${language}${url}`:url;
  return <section className={styles.section} aria-label={english?"EPUREAU news and film":"Actualités et film EPUREAU"}>
    <div className={`shell ${styles.layout}`} data-columns={Boolean(announcements.length && video)}>
      {announcements.length>0&&<div className={styles.news}>
        <h2>{english?"News":"À la une"}</h2>
        {announcements.map(({key,data})=><article key={key} className={styles.announcement}>
          <span className={styles.category}>{english?categories[data.category]||data.category:data.category}</span>
          <h3>{data.title}</h3><p>{data.description}</p>
          {data.url&&<a href={localLink(data.url)}>{data.linkLabel || (english?"Find out more":"En savoir plus")}<Icon name="arrow"/></a>}
        </article>)}
      </div>}
      {video&&<div className={styles.film}>
        <span className={styles.category}>{english?"Corporate film":"Film institutionnel"}</span>
        <h2>{video.title}</h2>
        <MediaVideo key={video.url} url={video.url} title={video.title} image={video.image}/>
        {video.description&&<p>{video.description}</p>}
      </div>}
    </div>
  </section>;
}
