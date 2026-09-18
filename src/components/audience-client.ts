"use client";

/** Refus de mesure : choix du visiteur conservé sur son propre poste uniquement. */
export const CLE_CONSENTEMENT = "epureau-cookies";

export function mesureAutorisee() {
  if (typeof window === "undefined") return false;
  if (navigator.doNotTrack === "1" || (window as { doNotTrack?: string }).doNotTrack === "1") return false;
  try {
    const brut = localStorage.getItem(CLE_CONSENTEMENT);
    if (!brut) return true; // Mesure anonyme sans cookie : active tant qu'elle n'est pas refusée.
    return JSON.parse(brut).mesure !== false;
  } catch { return true; }
}

function envoyer(corps: Record<string, string>) {
  if (!mesureAutorisee()) return;
  try {
    fetch("/api/audience", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps), keepalive: true }).catch(() => {});
  } catch { /* la mesure ne bloque jamais la page */ }
}

export function mesurerPage(chemin: string) {
  envoyer({ type: "page", chemin, titre: document.title, referent: document.referrer, langue: navigator.language });
}

/** Conversion : demande de cotation, réclamation, téléchargement. */
export function mesurerConversion(libelle: string) {
  envoyer({ type: "conversion", chemin: location.pathname, libelle });
}
