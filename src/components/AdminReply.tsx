"use client";
import { useState } from "react";
import { replyEmail } from "@/content/reply-email";
type Sent={key:string;canRetry:boolean;value:{subject:string;message:string;signature:string;date:string;status:string}};
export default function AdminReply({requestKey,email,subject}:{requestKey:string;email:string;subject:string}){
 const [title,setTitle]=useState("Re : "+subject),[message,setMessage]=useState(""),[id,setId]=useState("");
 const [configured,setConfigured]=useState(false),[replyTo,setReplyTo]=useState(""),[history,setHistory]=useState<Sent[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[attempted,setAttempted]=useState(false);
 async function load(){const r=await fetch("/api/admin/replies?requestKey="+encodeURIComponent(requestKey));if(!r.ok)throw new Error("Historique indisponible.");const d=await r.json();setConfigured(d.configured);setReplyTo(d.replyTo);setHistory(d.replies);}
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice("");const token=id||crypto.randomUUID();setId(token);setAttempted(true);
  try{const r=await fetch("/api/admin/replies",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestKey,id:token,subject:title,message})});const d=await r.json();if(!r.ok)throw new Error(d.message);setNotice("E-mail accepté par le service d’envoi.");setMessage("");setId("");setAttempted(false);await load();}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}
 }
 return <details onToggle={e=>{if(e.currentTarget.open)load().catch(()=>setNotice("Historique indisponible."));}}><summary>Répondre par e-mail · Historique ({history.length})</summary>
 {!configured&&<p role="status">L’envoi sera disponible après la configuration du domaine et du service e-mail.</p>}
 <form onSubmit={send}><p>Destinataire : <strong>{email}</strong></p>{replyTo&&<p>Les réponses du client arriveront à {replyTo}.</p>}
 <fieldset disabled={busy||attempted}><label>Objet<input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} /></label><label>Votre réponse<textarea required rows={8} maxLength={12000} value={message} onChange={e=>setMessage(e.target.value)} /></label></fieldset>
 <details><summary>Aperçu de l’e-mail</summary><iframe title="Aperçu de la réponse" sandbox="" srcDoc={replyEmail(title,message,"Votre signature sera ajoutée automatiquement")} style={{width:"100%",height:420,border:"1px solid #dae3ed"}} /></details>
 <button className="admin-button" disabled={busy||!configured||!message.trim()}>{busy?"Envoi…":attempted?"Réessayer le même envoi":"Envoyer la réponse"}</button></form>
 {notice&&<p role="status">{notice}</p>}
 {history.map(r=><article key={r.key}><h4>{r.value.subject}</h4><small>{new Date(r.value.date).toLocaleString("fr-FR")} · {r.value.signature} · {r.value.status==="sent"?"Accepté par le service d’envoi":"Envoi non confirmé"}</small><p style={{whiteSpace:"pre-wrap"}}>{r.value.message}</p>{r.canRetry&&<button type="button" className="admin-button secondary" disabled={busy} onClick={()=>{setId(r.key);setTitle(r.value.subject);setMessage(r.value.message);setAttempted(true);setNotice("Message repris : réessayez cet envoi pour éviter un doublon.");}}>Reprendre cet envoi</button>}</article>)}
 </details>;
}
