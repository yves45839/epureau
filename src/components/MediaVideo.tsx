"use client";
import {useUi} from "./UiText";
import { useState } from "react";
export default function MediaVideo({url,title,image}:{url:string;title:string;image:string}){
 const ui=useUi();
 const [playing,setPlaying]=useState(false);
 let youtube="";
 try{const parsed=new URL(url);if(["www.youtube.com","youtube.com","youtu.be"].includes(parsed.hostname)){const id=parsed.hostname==="youtu.be"?parsed.pathname.slice(1):parsed.searchParams.get("v")||parsed.pathname.split("/").pop();if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id))youtube="https://www.youtube-nocookie.com/embed/"+id;}}catch{}
 if(!url)return <div className="media-pending">{image&&<img src={image} alt="" width="480" height="270" loading="lazy" />}<p>{title} — {ui("vidéo à venir")}</p></div>;
 if(!playing)return <button className="media-play" type="button" onClick={()=>setPlaying(true)} aria-label={ui("Lire")+" : "+title}>{image&&<img src={image} alt="" width="480" height="270" loading="lazy" />}<span>▶ {ui("Lire la vidéo")}</span></button>;
 return youtube?<iframe src={youtube} title={title} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />:<video src={url} controls autoPlay poster={image} aria-label={title} />;
}
