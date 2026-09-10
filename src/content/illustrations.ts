/** Visuels générés pour illustrer les métiers, jamais des références de chantiers. */
export const illustrations = {
  ingenierie: {
    src: "/images/illustrations/ingenierie.webp",
    alt: "ingénieurs ouest-africains sur une installation de traitement de l'eau",
    position: "62% 50%",
  },
  industrie: {
    src: "/images/illustrations/industrie.webp",
    alt: "technicienne ouest-africaine et équipements industriels en inox",
    position: "62% 50%",
  },
  hygiene: {
    src: "/images/illustrations/hygiene.webp",
    alt: "entretien du linge dans une buanderie professionnelle en contexte ouest-africain",
    position: "62% 50%",
  },
} as const;

export const visuelsDomaines = [illustrations.ingenierie, illustrations.industrie, illustrations.hygiene, illustrations.industrie];
