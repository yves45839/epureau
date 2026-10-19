"use client";
import {useEffect, useId, useRef, useState} from "react";
import type {Media} from "@/content/admin-types";
import {videoSource} from "@/content/home-highlights";
import {useLanguage} from "./UiText";
import Image from "./SiteImage";
import Icon from "./Icon";
import styles from "./HomeHeroVideo.module.css";

export default function HomeHeroVideo({video}: {video:Media}) {
  const english=useLanguage()==="en";
  const [open,setOpen]=useState(false),[failed,setFailed]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),player=useRef<HTMLVideoElement>(null);
  const id=useId(),source=videoSource(video.url);
  useEffect(()=>{
    if(!open){dialog.current?.close();return;}
    dialog.current?.showModal();
    // Start after the dialog is visible; autoplay may be paused while it is hidden.
    void player.current?.play().catch(()=>{});
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=overflow;};
  },[open]);
  if(!source)return null;
  const close=()=>{setOpen(false);setFailed(false);trigger.current?.focus({preventScroll:true});};
  const thumbnail=<>
    <Image src={video.image||"/images/illustrations/panorama-eau.webp"} alt="" width={480} height={270} sizes="(max-width: 700px) 210px, 300px" />
    <span className={styles.play} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z"/></svg></span>
    <span className={styles.caption}><span>{english?"Watch the video":"Voir la vidéo"}{source.kind==="sharepoint"&&" ↗"}</span><strong>{video.title}</strong></span>
  </>;
  if(source.kind==="sharepoint")return <div className={styles.root}><a className={styles.thumbnail} href={source.src} target="_blank" rel="noopener noreferrer" aria-label={(english?"Watch the video: ":"Voir la vidéo : ")+video.title+(english?" (new tab)":" (nouvel onglet)")}>{thumbnail}</a></div>;
  return <div className={styles.root}>
    <button ref={trigger} type="button" className={styles.thumbnail} onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-controls={id} aria-label={(english?"Watch the video: ":"Voir la vidéo : ")+video.title}>
      {thumbnail}
    </button>
    <dialog id={id} ref={dialog} className={styles.dialog} aria-labelledby={id+"-title"} onClose={close} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}}>
      <div className={styles.heading}><h2 id={id+"-title"}>{video.title}</h2><button type="button" className={styles.close} aria-label={english?"Close the video":"Fermer la vidéo"} onClick={()=>setOpen(false)} autoFocus><Icon name="x"/></button></div>
      {open&&(failed?<div className={styles.error} role="alert"><p>{english?"The video could not be loaded.":"La vidéo n’a pas pu être chargée."}</p><a href={video.url} target="_blank" rel="noopener noreferrer">{english?"Open the video in a new tab":"Ouvrir la vidéo dans un nouvel onglet"}</a></div>:source.kind==="youtube"?<iframe className={styles.player} src={source.src} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<video ref={player} className={styles.player} src={source.src} poster={video.image} controls autoPlay playsInline preload="metadata" aria-label={video.title} onError={()=>setFailed(true)}/>)}
    </dialog>
  </div>;
}
