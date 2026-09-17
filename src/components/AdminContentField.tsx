"use client";
import {useState} from "react";
type Field={key:string;label:string;type?:string};
export default function ContentField({field,value,onChange}:{field:Field;value:string;onChange:(value:string)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function upload(file?:File){
  if(!file)return;setBusy(true);setError("");
  try{if(file.size>4*1024*1024)throw new Error("Choisissez un fichier de 4 Mo maximum.");const form=new FormData();form.set("file",file);const r=await fetch("/api/admin/upload",{method:"POST",body:form});const data=await r.json();if(!r.ok)throw new Error(data.message);onChange(data.url);}catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <div className="admin-field"><label>{field.label}{field.type==="long"?<textarea rows={4} value={value} onChange={e=>onChange(e.target.value)} maxLength={24000} />:field.type==="mediaType"?<select value={value} onChange={e=>onChange(e.target.value)}><option value="photo">Photo</option><option value="video">Vidéo</option></select>:field.key==="blogEnabled"?<select value={value} onChange={e=>onChange(e.target.value)}><option value="non">Non</option><option value="oui">Oui</option></select>:<input value={value} onChange={e=>onChange(e.target.value)} maxLength={24000} />}</label>{["image","url"].includes(field.type||"")&&<><label className="admin-upload">{busy?"Téléversement…":"Choisir un fichier · 4 Mo max"}<input type="file" accept={field.type==="image"?"image/jpeg,image/png,image/webp":"image/jpeg,image/png,image/webp,application/pdf"} disabled={busy} onChange={e=>upload(e.target.files?.[0])} /></label>{field.type==="image"&&value&&<img className="admin-image-preview" src={value} alt="Aperçu du visuel" />}</>}{error&&<p role="alert" className="admin-error">{error}</p>}</div>;
}
