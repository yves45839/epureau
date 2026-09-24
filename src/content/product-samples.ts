import type { ContentData } from "./admin-types";

// Sources fabricant vérifiées le 24 septembre 2026. Les références régionales
// servent d'exemples : disponibilité et conditionnement à confirmer par EPUREAU.
const samples = [
  {
    slug: "nalco-3dt230", nom: "3D TRASAR™ 3DT230", marque: "NALCO", reference: "3DT230",
    categorie: "Refroidissement", gamme: "3D TRASAR™", image: "",
    texte: "Inhibiteur de corrosion et de dépôts pour les circuits d’eau de refroidissement. Une référence à sélectionner après analyse de votre eau et de vos conditions d’exploitation.",
    usage: "Traitement des circuits d’eau de refroidissement en recirculation.", secteurs: "Industries et utilités", forme: "Liquide · conditionnement à confirmer",
    points: "Protection contre la corrosion et les dépôts\nSuivi du traitement avec la technologie 3D TRASAR\nSélection accompagnée par une équipe technique",
    fiche: "https://www.ecolab.com/-/media/Ecolab/Ecolab-Home/Documents/DocumentLibrary/Asia-Pacific/Korea/Product-pages/3DT230-pdf.pdf?la=en",
    documentType: "Fiche technique", documentLangue: "EN",
    sourceUrl: "https://www.ecolab.com/nalco-water/offerings/3d-trasar-technology-for-cooling-water",
    en: { categorie: "Cooling water", texte: "Corrosion and deposit inhibitor for recirculating cooling water. Product selection requires a review of your water analysis and operating conditions.", usage: "Treatment of recirculating cooling water systems.", secteurs: "Industry and utilities", forme: "Liquid · packaging to be confirmed", points: "Corrosion and deposit control\nTreatment monitoring with 3D TRASAR technology\nSelection supported by a technical team" },
  },
  {
    slug: "nalco-3d-trasar-chaudieres", nom: "3D TRASAR™ Boiler Premium", marque: "NALCO", reference: "3D TRASAR Boiler Premium",
    categorie: "Chaudières", gamme: "Équipements et suivi", image: "",
    texte: "Système de surveillance et de pilotage du traitement des eaux de chaudière. Il associe mesures en ligne et contrôle du programme de traitement.",
    usage: "Surveillance du traitement des eaux de chaudière.", secteurs: "Sites industriels et production de vapeur", forme: "Équipement · configuration selon installation",
    points: "Mesures en ligne\nSuivi du programme de traitement\nConfiguration adaptée à votre chaufferie",
    fiche: "https://assets.pim.ecolab.com/media/Original/10000/SPEC-772%203D_TRASAR_Boilers_Premium.pdf",
    documentType: "Fiche technique", documentLangue: "EN",
    sourceUrl: "https://en-la.ecolab.com/nalco-water/offerings/3d-trasar-technology-for-boilers",
    en: { categorie: "Boilers", gamme: "Equipment and monitoring", texte: "Monitoring and control system for boiler water treatment, combining online measurements with treatment programme control.", usage: "Monitoring of boiler water treatment.", secteurs: "Industrial sites and steam generation", forme: "Equipment · site-specific configuration", points: "Online measurements\nTreatment programme monitoring\nConfiguration tailored to your boiler plant" },
  },
  {
    slug: "ecolab-maxx-magic2", nom: "MAXX Magic2", marque: "ECOLAB", reference: "MAXX Magic2",
    categorie: "Hygiène des surfaces", gamme: "MAXX2", image: "",
    texte: "Nettoyant multi-usages pour l’entretien des surfaces résistantes à l’eau. Il convient au nettoyage manuel et mécanisé des sols, selon les préconisations du fabricant.",
    usage: "Entretien des sols et surfaces résistants à l’eau.", secteurs: "Bureaux, collectivités, hôtellerie et sites industriels", forme: "Flacons de 1 L ou bidons de 5 L · selon disponibilité locale",
    points: "Nettoyage manuel ou mécanisé\nPouvoir mouillant\nEntretien courant des surfaces",
    fiche: "https://en-uk.ecolab.com/-/media/Widen/Institutional/Buildings--Facilities/MAXX_MAGIC2_Sellsheet_EU-EN_pdf.pdf",
    documentType: "Fiche technique", documentLangue: "EN",
    sourceUrl: "",
    en: { categorie: "Surface hygiene", texte: "Multi-purpose cleaner for water-resistant surfaces. Suitable for manual and machine floor cleaning in accordance with the manufacturer's instructions.", usage: "Maintenance of water-resistant floors and surfaces.", secteurs: "Offices, public buildings, hospitality and industrial sites", forme: "1 L bottles or 5 L containers · subject to local availability", points: "Manual or machine cleaning\nWetting performance\nDaily surface maintenance" },
  },
  {
    slug: "ecolab-topax-duo", nom: "Topax Duo", marque: "ECOLAB", reference: "Topax Duo",
    categorie: "Hygiène agroalimentaire", gamme: "Food & Beverage", image: "",
    texte: "Nettoyant moussant alcalin pour les sols, parois et équipements de l’industrie agroalimentaire. Le choix du protocole dépend des surfaces et du plan d’hygiène du site.",
    usage: "Nettoyage moussant des installations agroalimentaires.", secteurs: "Agroalimentaire et transformation de volailles", forme: "Concentré · conditionnement à confirmer",
    points: "Nettoyage des graisses et résidus protéiques\nApplication sous forme de mousse\nAccompagnement du plan d’hygiène",
    fiche: "https://en-sg.ecolab.com/-/media/Ecolab/Ecolab-Home/Documents/DocumentLibrary/F-and-B/Topax-Duo-Sell-Sheet-pdf.pdf",
    documentType: "Brochure fabricant", documentLangue: "EN",
    sourceUrl: "https://en-sg.ecolab.com/offerings/topax-duo-and-topax-duo-plus",
    en: { categorie: "Food and beverage hygiene", texte: "Alkaline foam cleaner for floors, walls and equipment in food processing. The cleaning protocol depends on the surfaces and the site's hygiene plan.", usage: "Foam cleaning in food processing facilities.", secteurs: "Food and poultry processing", forme: "Concentrate · packaging to be confirmed", points: "Removal of fat and protein residues\nFoam application\nSupport for your hygiene programme" },
  },
];

export const productSamples = samples.map(({slug, en, ...data}) => ({slug, data: {
  ...data,
  __en: JSON.stringify(Object.fromEntries(Object.entries(en).map(([key, text]) => ["field:" + key, {source: data[key as keyof typeof data], text, manual: true}]))),
} as ContentData}));
