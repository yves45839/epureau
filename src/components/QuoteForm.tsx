"use client";

import { useState } from "react";
import Icon from "./Icon";
import { objetsDemande } from "@/content/site";
import { mesurerConversion } from "./audience-client";

type Etat = "repos" | "envoi" | "ok" | "erreur";

export default function QuoteForm() {
  const [etat, setEtat] = useState<Etat>("repos");
  const [message, setMessage] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setEtat("envoi");
    try {
      const r = await fetch("/api/cotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message ?? "Envoi impossible");
      setEtat("ok");
      mesurerConversion("Demande de cotation");
      form.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Envoi impossible");
      setEtat("erreur");
    }
  }

  return (
    <form className="form rv" id="form" onSubmit={envoyer} noValidate>
      <h3>Demande de cotation ou d&apos;information</h3>
      <p className="sub">
        Décrivez-nous votre installation : nous revenons vers vous avec une proposition chiffrée.
      </p>

      <div className="fg">
        <div className="fld">
          <input id="f1" name="nom" type="text" placeholder=" " required autoComplete="name" />
          <label htmlFor="f1">Nom et prénom *</label>
        </div>
        <div className="fld">
          <input id="f2" name="societe" type="text" placeholder=" " required autoComplete="organization" />
          <label htmlFor="f2">Société / établissement *</label>
        </div>
        <div className="fld">
          <input id="f3" name="email" type="email" placeholder=" " required autoComplete="email" />
          <label htmlFor="f3">E-mail professionnel *</label>
        </div>
        <div className="fld">
          <input id="f4" name="telephone" type="tel" placeholder=" " autoComplete="tel" />
          <label htmlFor="f4">Téléphone</label>
        </div>
        <div className="fld full">
          <select id="f5" name="objet" defaultValue={objetsDemande[0]}>
            {objetsDemande.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <label htmlFor="f5">Objet de la demande</label>
        </div>
        <div className="fld full">
          <textarea id="f6" name="besoin" placeholder=" " required />
          <label htmlFor="f6">Votre besoin (effluent, débit, site, contraintes…) *</label>
        </div>
      </div>

      {/* piège à robots — laissé vide par les humains */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <button className="btn btn-primary" type="submit" disabled={etat === "envoi"}>
        {etat === "envoi" ? "Envoi en cours…" : "Envoyer ma demande"} <Icon name="send" />
      </button>

      {etat === "erreur" && (
        <p role="alert" style={{ marginTop: 14, fontSize: 13.5, color: "#B4232A" }}>
          {message} — vous pouvez aussi nous écrire directement à{" "}
          <a href="mailto:epureau@epureau-ci.com">epureau@epureau-ci.com</a>.
        </p>
      )}

      <div className={`done${etat === "ok" ? " show" : ""}`} aria-live="polite">
        <div>
          <span className="ck">
            <Icon name="check" />
          </span>
          <b>Demande envoyée</b>
          <p>
            Copie transmise à nos équipes et enregistrée dans le tableau de bord de suivi. Nous vous
            répondons sous 48 h ouvrées.
          </p>
        </div>
      </div>
    </form>
  );
}
