"use client";
import { useEffect, useRef, useState } from "react";
import { readEnglish, translationUnits, type TranslationField } from "@/content/translations";
import type { ContentData } from "@/content/admin-types";
import { chromeTranslator, translateText, type LocalTranslator } from "./chrome-translator";

export default function AdminEnglish({data,fields,section,onChange,onBusy}:{data:ContentData;fields:TranslationField[];section:string;onChange:(value:string)=>void;onBusy:(busy:boolean)=>void}) {
  const [available,setAvailable]=useState<string>("checking");
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(""),[error,setError]=useState("");
  const [filter,setFilter]=useState("");
  const controller=useRef<AbortController|null>(null);
  const engine=useRef<LocalTranslator|null>(null);
  const active=useRef(true);
  const translations=readEnglish(data);
  const units=translationUnits(data,fields,section);
  const pending=units.filter(unit=>!translations[unit.key]?.manual && (!translations[unit.key]?.text.trim() || translations[unit.key].source!==unit.source));
  const outdated=units.filter(unit=>translations[unit.key]?.source!==unit.source && translations[unit.key]?.text);
  const complete=units.filter(unit=>translations[unit.key]?.source===unit.source && translations[unit.key]?.text.trim()).length;
  useEffect(()=>{
    active.current=true;
    const api=chromeTranslator();
    Promise.resolve(api?api.availability({sourceLanguage:"fr",targetLanguage:"en"}):"unsupported")
      .then(value=>{if(active.current)setAvailable(value);})
      .catch(()=>{if(active.current)setAvailable("unavailable");});
    return()=>{active.current=false;controller.current?.abort();engine.current?.destroy();engine.current=null;};
  },[]);
  async function translate() {
    const api=chromeTranslator();
    if(!api || busy || !pending.length)return;
    const abort=new AbortController();controller.current=abort;
    setBusy(true);onBusy(true);setError("");setStatus("Préparation du modèle français → anglais…");
    try {
      // Called directly from the click handler: Chrome requires user activation for model download.
      const translator=await api.create({sourceLanguage:"fr",targetLanguage:"en",signal:abort.signal,monitor:monitor=>monitor.addEventListener("downloadprogress",event=>{
        if(active.current&&!abort.signal.aborted)setStatus(`Téléchargement du modèle : ${Math.round(event.loaded*100)} %`);
      })});
      engine.current=translator;
      if(abort.signal.aborted)throw new DOMException("Annulé","AbortError");
      const next={...translations};
      const memo=new Map<string,string>();
      for(let i=0;i<pending.length;i++) {
        const unit=pending[i];
        if(active.current)setStatus(`Traduction ${i+1} / ${pending.length} : ${unit.label}`);
        const text=memo.get(unit.source) ?? await translateText(translator,unit.source,abort.signal);
        if(text.length>unit.limit)throw new Error(`La traduction de « ${unit.label} » dépasse ${unit.limit} caractères. Renseignez une version plus courte manuellement.`);
        memo.set(unit.source,text);
        next[unit.key]={source:unit.source,text,manual:false};
      }
      if(active.current&&!abort.signal.aborted) {
        onChange(JSON.stringify(next));
        setAvailable("available");
        setStatus("Traductions prêtes à relire. Enregistrez le brouillon, puis publiez lorsque vous avez terminé.");
      }
    } catch(e) {
      if(active.current) {
        if(abort.signal.aborted)setStatus("Traduction annulée. Les textes existants sont conservés.");
        else {setError(e instanceof Error?e.message:"Traduction indisponible. Réessayez dans Chrome sur ordinateur.");setStatus("");}
      }
    } finally {
      engine.current?.destroy();engine.current=null;
      if(active.current){setBusy(false);onBusy(false);}
    }
  }
  function edit(key:string,source:string,text:string){onChange(JSON.stringify({...translations,[key]:{source,text,manual:true}}));}
  return <section className="admin-english" aria-labelledby="english-heading">
    <div className="admin-row"><h3 id="english-heading">Version anglaise</h3><span className="admin-badge">{complete} / {units.length} textes à jour</span></div>
    <p>Traduction locale dans Chrome sur ordinateur. Le premier usage télécharge le modèle. Les textes restent sur cet ordinateur pendant la traduction ; ils sont enregistrés dans le site avec votre brouillon.</p>
    <div className="admin-editor-actions">
      <button type="button" className="admin-button secondary" disabled={busy||!pending.length||["checking","unsupported","unavailable"].includes(available)} onClick={translate}>{busy?"Traduction en cours…":"Traduire les textes nouveaux ou modifiés"}</button>
      {busy&&<button type="button" className="admin-button secondary" onClick={()=>{controller.current?.abort();engine.current?.destroy();}}>Annuler</button>}
    </div>
    {available==="checking"&&<p role="status">Vérification du moteur Chrome…</p>}
    {["unsupported","unavailable"].includes(available)&&<p className="admin-info">La traduction automatique n’est pas disponible ici. Ouvrez cette administration dans une version récente de Chrome sur ordinateur, en HTTPS ou sur localhost. Vous pouvez toujours saisir l’anglais ci-dessous.</p>}
    {outdated.length>0&&<p className="admin-info">{outdated.length} traduction(s) à actualiser. Les corrections manuelles sont protégées : relisez-les ou autorisez leur remplacement.</p>}
    {status&&<p role="status" aria-live="polite">{status}</p>}{error&&<p role="alert" className="admin-error">{error}</p>}
    <details><summary>Relire et corriger l’anglais</summary><fieldset disabled={busy}>
      <label>Rechercher un texte<input value={filter} onChange={e=>setFilter(e.target.value)} /></label>
      {units.filter(unit=>`${unit.label} ${unit.source}`.toLowerCase().includes(filter.toLowerCase())).map(unit=>{
        const entry=translations[unit.key];const stale=Boolean(entry&&entry.source!==unit.source);
        return <div className="admin-translation-field" key={unit.key}>
          <label>{unit.label}<span lang="fr" className="admin-translation-source">{unit.source}</span>
            <textarea lang="en" rows={3} maxLength={unit.limit} value={entry?.text||""} placeholder="English translation" onChange={e=>edit(unit.key,unit.source,e.target.value)} />
          </label>
          <small>{stale?"Le français a changé — traduction à revoir.":entry?.manual?"Correction manuelle protégée.":entry?.text?"Traduction automatique à relire.":"Pas encore traduit : le français sera affiché."}</small>
          {stale&&entry?.text&&<button type="button" onClick={()=>edit(unit.key,unit.source,entry.text)}>Valider cette traduction pour le nouveau français</button>}
          {entry?.manual&&<button type="button" onClick={()=>{const next={...translations};delete next[unit.key];onChange(JSON.stringify(next));}}>Effacer et autoriser une nouvelle traduction</button>}
        </div>;
      })}
    </fieldset></details>
  </section>;
}
