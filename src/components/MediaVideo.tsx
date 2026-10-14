"use client";
import {useUi} from "./UiText";
import { useState } from "react";
import {videoSource} from "@/content/home-highlights";
import Icon from "./Icon";
import Image from "./SiteImage";
import styles from "./MediaVideo.module.css";
export default function MediaVideo({url,title,image}:{url:string;title:string;image:string}){
 const ui=useUi();
 const [playing,setPlaying]=useState(false);
 const source=videoSource(url);
 if(!url)return <div className="media-pending">{image&&<Image src={image} alt="" width="480" height="270" loading="lazy" />}<p>{title} — {ui("vidéo à venir")}</p></div>;
 if(!source)return <p>{title} — {ui("vidéo à venir")}</p>;
 if(!playing)return <button className={styles.player} type="button" onClick={()=>setPlaying(true)} aria-label={ui("Lire")+" : "+title}>{image&&<Image src={image} alt="" width="480" height="270" loading="lazy" />}<span className={styles.play}><Icon name="youtube" size={32}/>{ui("Lire la vidéo")}</span></button>;
 return source.kind==="youtube"?<iframe className={styles.player} src={source.src} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />:<video className={styles.player} src={source.src} controls autoPlay playsInline preload="metadata" poster={image} aria-label={title} />;
}
