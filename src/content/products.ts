/** Marques sous lesquelles les fiches produits sont classées sur la page « Négoce ». */
export const marquesProduits = ["NALCO", "ECOLAB", "Commodités & Réactifs"] as const;
export type MarqueProduit = typeof marquesProduits[number];

export function marqueValide(valeur: string): valeur is MarqueProduit {
  return (marquesProduits as readonly string[]).includes(valeur);
}

/** Ancre de la section correspondante sur /negoce. */
export const ancreMarque: Record<string, string> = {
  "NALCO": "nalco",
  "ECOLAB": "ecolab",
  "Commodités & Réactifs": "commodites",
};
