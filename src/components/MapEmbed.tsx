"use client";

import UiText from "./UiText";
import { useState } from "react";
import Icon from "./Icon";

/**
 * Carte Google Maps de la page contact (EF-21).
 * Chargement à la demande : rien n'est transmis à Google tant que le visiteur
 * n'a pas demandé l'affichage — cohérent avec le bandeau de consentement.
 */
export default function MapEmbed({ lieu, adresse }: { lieu: string; adresse: string }) {
  const [affichee, setAffichee] = useState(false);
  const lien = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(lieu);

  return (
    <div className="carte rv">
      {affichee ? (
        <iframe
          title={"Localisation d’EPUREAU Côte d’Ivoire (" + lieu + ") sur Google Maps"}
          src={"https://www.google.com/maps?q=" + encodeURIComponent(lieu) + "&hl=fr&z=16&output=embed"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="carte-attente">
          <span className="ic"><Icon name="pin" /></span>
          <b>{adresse}</b>
          <p><UiText text={"Notre établissement est référencé "} /><b><UiText text={"Epureau CI"} /></b><UiText text={" sur Google Maps. La carte est fournie par Google : en l’affichant, vous acceptez le dépôt de ses cookies."} /></p>
          <div className="carte-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setAffichee(true)}><UiText text={"Afficher la carte"} /></button>
            <a className="arrow-link" href={lien} target="_blank" rel="noopener"><UiText text={"Ouvrir dans Google Maps "} /><Icon name="arrow" /></a>
          </div>
        </div>
      )}
    </div>
  );
}
