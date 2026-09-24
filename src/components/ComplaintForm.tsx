"use client";

import UiText from "./UiText";
import { useRef, useState } from "react";
import { societe } from "@/content/site";
import { mesurerConversion } from "./audience-client";

export default function ComplaintForm() {
  const pending = useRef(false);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    const form = event.currentTarget;
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/reclamation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Envoi impossible pour le moment.");
      setMessage(`Votre réclamation a été reçue. Référence à conserver : ${result.reference}. Notre équipe vous recontactera aux coordonnées indiquées.`);
      setState("success");
      mesurerConversion("Réclamation client");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Envoi impossible pour le moment.");
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  return <form className="customer-form" onSubmit={submit} aria-label="Formulaire de réclamation client" aria-busy={state === "sending"}>
    <h2><UiText text={"Votre réclamation"} /></h2>
    <p><UiText text={"Les champs marqués d’un astérisque sont obligatoires."} /></p>
    <fieldset disabled={state === "sending"}>
      <div className="customer-fields">
        <label><UiText text={"Nom et prénom *"} /><input name="nom" autoComplete="name" minLength={2} maxLength={120} required /></label>
        <label><UiText text={"Société / établissement *"} /><input name="societe" autoComplete="organization" minLength={2} maxLength={160} required /></label>
        <label><UiText text={"E-mail *"} /><input name="email" type="email" autoComplete="email" maxLength={160} required /></label>
        <label><UiText text={"Téléphone"} /><input name="telephone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className="full"><UiText text={"Produit ou prestation concerné *"} /><select name="categorie" defaultValue="" required>
          <option value="" disabled><UiText text={"Sélectionner un domaine"} /></option>
          <option value={"Ingénierie de l’eau"}><UiText text={"Ingénierie de l’eau"} /></option><option value={"Services aux industries"}><UiText text={"Services aux industries"} /></option><option value={"Hygiène institutionnelle"}><UiText text={"Hygiène institutionnelle"} /></option><option value={"Produits chimiques"}><UiText text={"Produits chimiques"} /></option><option value={"Facturation ou livraison"}><UiText text={"Facturation ou livraison"} /></option><option value={"Autre"}><UiText text={"Autre"} /></option>
        </select></label>
        <label className="full"><UiText text={"Référence de commande, facture ou projet"} /><input name="commande" maxLength={120} /></label>
        <label className="full"><UiText text={"Décrivez le problème rencontré *"} /><textarea name="description" minLength={10} maxLength={4000} rows={5} required /></label>
        <label className="full"><UiText text={"Quelle solution attendez-vous ?"} /><textarea name="attente" maxLength={2000} rows={3} /></label>
      </div>
      <div className="form-trap" aria-hidden="true"><label><UiText text={"Site internet"} /><input name="site" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="customer-note"><UiText text={"Vos coordonnées et les informations fournies servent à traiter votre réclamation et à vous recontacter. Évitez de transmettre des données sensibles dans ce formulaire."} /></p>
      <button className="btn btn-primary" type="submit"><UiText text={state === "sending" ? "Envoi en cours…" : "Envoyer ma réclamation"} /></button>
    </fieldset>
    <div aria-live="polite" aria-atomic="true">{state === "success" && <p className="customer-feedback success">{message}</p>}</div>
    {state === "error" && <p className="customer-feedback error" role="alert">{message}<UiText text={" Vous pouvez nous écrire à "} /><a href={`mailto:${societe.email}`}>{societe.email}</a><UiText text={". Les informations saisies ont été conservées dans le formulaire."} /></p>}
  </form>;
}
