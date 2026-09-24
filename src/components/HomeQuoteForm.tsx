"use client";

import UiText, {useUi} from "./UiText";
import { useEffect, useRef, useState } from "react";
import { objetsDemande } from "@/content/site";
import { mesurerConversion } from "./audience-client";

type Domain = "" | "ingenierie" | "industries" | "hygiene" | "produits" | "autre";
const placeholders: Record<Domain, string> = {
  "": "Décrivez brièvement votre demande.",
  ingenierie: "Type d’installation, localisation, besoins et contraintes…",
  industries: "Activité du site, installations concernées et besoin d’accompagnement…",
  hygiene: "Type d’établissement, entretien du linge, locaux ou cuisines…",
  produits: "Produits recherchés, conditionnement et quantités souhaitées…",
  autre: "Décrivez brièvement votre demande.",
};

export default function HomeQuoteForm() {
  const ui=useUi();
  const formRef = useRef<HTMLFormElement>(null);
  const request = useRef<AbortController | null>(null);
  const [domain, setDomain] = useState<Domain>("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const root = formRef.current?.closest(".home-experience");
    const selectService = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (Object.hasOwn(placeholders, value)) setDomain(value as Domain);
    };
    root?.addEventListener("epureau:service", selectService);
    return () => {
      root?.removeEventListener("epureau:service", selectService);
      request.current?.abort();
    };
  }, []);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const objects: Partial<Record<Domain, string>> = {
      ingenierie: objetsDemande[0], industries: objetsDemande[1], hygiene: objetsDemande[2], autre: objetsDemande[6],
    };
    const payload = {
      nom: String(data.get("nom") ?? ""), societe: String(data.get("societe") ?? ""),
      email: String(data.get("email") ?? ""), telephone: String(data.get("telephone") ?? ""),
      objet: domain === "produits" ? String(data.get("gamme") ?? "") : objects[domain],
      besoin: String(data.get("besoin") ?? ""), site: String(data.get("site") ?? ""),
    };
    const controller = new AbortController();
    request.current = controller;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/cotation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message ?? "Envoi impossible pour le moment.");
      form.reset();
      setDomain("");
      setStatus("success");
      mesurerConversion("Demande de cotation");
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : "Envoi impossible pour le moment.");
      setStatus("error");
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <form id="quote-form" className="quote-form reveal" ref={formRef} onSubmit={send}>
      <label htmlFor="need"><UiText text={"Votre demande concerne"} /></label>
      <select id="need" value={domain} onChange={event => setDomain(event.target.value as Domain)} required>
        <option value="" disabled><UiText text={"Choisir un domaine"} /></option>
        <option value="ingenierie"><UiText text={"Ingénierie du traitement de l’eau"} /></option>
        <option value="industries"><UiText text={"Service aux industries"} /></option>
        <option value="hygiene"><UiText text={"Hygiène institutionnelle"} /></option>
        <option value="produits"><UiText text={"Produits chimiques"} /></option>
        <option value="autre"><UiText text={"Autre demande"} /></option>
      </select>
      {domain === "produits" && <><label htmlFor="product-range"><UiText text={"Gamme de produits"} /></label><select id="product-range" name="gamme" defaultValue="" required><option value="" disabled><UiText text={"Choisir une gamme"} /></option>{objetsDemande.slice(3, 6).map(object => <option key={object} value={object}><UiText text={object} /></option>)}</select></>}
      <div className="field-row">
        <div><label htmlFor="name"><UiText text={"Nom et prénom"} /></label><input id="name" name="nom" autoComplete="name" minLength={2} maxLength={120} required /></div>
        <div><label htmlFor="company"><UiText text={"Société / établissement"} /></label><input id="company" name="societe" autoComplete="organization" minLength={2} maxLength={160} required /></div>
      </div>
      <label htmlFor="email"><UiText text={"E-mail professionnel"} /></label><input id="email" name="email" type="email" autoComplete="email" maxLength={160} required />
      <label htmlFor="telephone"><UiText text={"Téléphone (facultatif)"} /></label><input id="telephone" name="telephone" type="tel" autoComplete="tel" maxLength={40} />
      <label htmlFor="message"><UiText text={"Votre besoin"} /></label><textarea id="message" name="besoin" rows={3} placeholder={ui(placeholders[domain])} minLength={10} maxLength={4000} required />
      <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} />
      <button className="button" type="submit" disabled={status === "sending"}><UiText text={status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"} /><svg aria-hidden="true"><use href="#arrow" /></svg></button>
      {status === "success" && <p className="form-feedback success" role="status"><UiText text={"Votre demande a été prise en compte. Notre équipe reviendra vers vous."} /></p>}
      {status === "error" && <p className="form-feedback error" role="alert">{ui(error)}<UiText text={" Vous pouvez aussi écrire à "} /><a href="mailto:epureau@epureau-ci.com">epureau@epureau-ci.com</a>.</p>}
    </form>
  );
}
