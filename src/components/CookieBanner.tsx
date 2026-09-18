"use client";

import { useEffect, useState } from "react";
import { CLE_CONSENTEMENT } from "./audience-client";

/** Bandeau de gestion des cookies et du consentement (EF-29). */
export default function CookieBanner() {
  const [ouvert, setOuvert] = useState(false);
  const [details, setDetails] = useState(false);
  const [mesure, setMesure] = useState(true);

  useEffect(() => {
    const lire = () => { try { return localStorage.getItem(CLE_CONSENTEMENT); } catch { return null; } };
    if (!lire()) setOuvert(true);
    const rouvrir = () => {
      const brut = lire();
      try { setMesure(brut ? JSON.parse(brut).mesure !== false : true); } catch { setMesure(true); }
      setDetails(true); setOuvert(true);
    };
    window.addEventListener("epureau-cookies", rouvrir);
    return () => window.removeEventListener("epureau-cookies", rouvrir);
  }, []);

  function decider(valeur: boolean) {
    try { localStorage.setItem(CLE_CONSENTEMENT, JSON.stringify({ mesure: valeur, date: new Date().toISOString() })); } catch { /* navigation privée */ }
    setOuvert(false); setDetails(false);
  }

  if (!ouvert) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-modal="false" aria-labelledby="cookie-titre">
      <div className="cookie-card">
        <div className="cookie-texte">
          <h2 id="cookie-titre">Votre vie privée</h2>
          <p>
            Ce site ne dépose aucun cookie publicitaire. Seule une mesure de fréquentation interne est réalisée,
            sans cookie et sans conserver votre adresse IP. Aucune donnée n’est transmise à un service tiers, sauf si
            vous demandez vous-même l’affichage de la carte Google Maps sur la page contact.
          </p>
          {details && (
            <ul className="cookie-liste">
              <li>
                <span><b>Fonctionnement du site</b><small>Sécurité des formulaires et affichage. Nécessaires, toujours actifs.</small></span>
                <span className="cookie-fixe">Toujours actifs</span>
              </li>
              <li>
                <label>
                  <span><b>Mesure de fréquentation</b><small>Pages consultées, provenance et type d’appareil, de façon anonyme.</small></span>
                  <input type="checkbox" checked={mesure} onChange={event => setMesure(event.target.checked)} />
                </label>
              </li>
            </ul>
          )}
        </div>
        <div className="cookie-actions">
          {details ? (
            <button type="button" className="cookie-btn cookie-accepte" onClick={() => decider(mesure)}>Enregistrer mes choix</button>
          ) : (
            <>
              <button type="button" className="cookie-btn cookie-accepte" onClick={() => decider(true)}>Tout accepter</button>
              <button type="button" className="cookie-btn cookie-refuse" onClick={() => decider(false)}>Refuser</button>
              <button type="button" className="cookie-lien" onClick={() => setDetails(true)}>Personnaliser</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
