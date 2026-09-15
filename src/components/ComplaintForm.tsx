"use client";

import { useRef, useState } from "react";
import { societe } from "@/content/site";

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
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Envoi impossible pour le moment.");
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  return <form className="customer-form" onSubmit={submit} aria-label="Formulaire de réclamation client" aria-busy={state === "sending"}>
    <h2>Votre réclamation</h2>
    <p>Les champs marqués d’un astérisque sont obligatoires.</p>
    <fieldset disabled={state === "sending"}>
      <div className="customer-fields">
        <label>Nom et prénom *<input name="nom" autoComplete="name" minLength={2} maxLength={120} required /></label>
        <label>Société / établissement *<input name="societe" autoComplete="organization" minLength={2} maxLength={160} required /></label>
        <label>E-mail *<input name="email" type="email" autoComplete="email" maxLength={160} required /></label>
        <label>Téléphone<input name="telephone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className="full">Produit ou prestation concerné *<select name="categorie" defaultValue="" required>
          <option value="" disabled>Sélectionner un domaine</option>
          <option>Ingénierie de l’eau</option><option>Services aux industries</option><option>Hygiène institutionnelle</option><option>Produits chimiques</option><option>Facturation ou livraison</option><option>Autre</option>
        </select></label>
        <label className="full">Référence de commande, facture ou projet<input name="commande" maxLength={120} /></label>
        <label className="full">Décrivez le problème rencontré *<textarea name="description" minLength={10} maxLength={4000} rows={5} required /></label>
        <label className="full">Quelle solution attendez-vous ?<textarea name="attente" maxLength={2000} rows={3} /></label>
      </div>
      <div className="form-trap" aria-hidden="true"><label>Site internet<input name="site" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="customer-note">Vos coordonnées et les informations fournies servent à traiter votre réclamation et à vous recontacter. Évitez de transmettre des données sensibles dans ce formulaire.</p>
      <button className="btn btn-primary" type="submit">{state === "sending" ? "Envoi en cours…" : "Envoyer ma réclamation"}</button>
    </fieldset>
    <div aria-live="polite" aria-atomic="true">{state === "success" && <p className="customer-feedback success">{message}</p>}</div>
    {state === "error" && <p className="customer-feedback error" role="alert">{message} Vous pouvez nous écrire à <a href={`mailto:${societe.email}`}>{societe.email}</a>. Les informations saisies ont été conservées dans le formulaire.</p>}
  </form>;
}
