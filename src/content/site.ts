// Contenu du site — source unique. Pour la version anglaise, dupliquer ce fichier
// (site.en.ts) et brancher la locale : la structure des pages reste identique.

export const societe = {
  nom: "EPUREAU Côte d’Ivoire",
  slogan: "Des solutions fiables pour votre satisfaction.",
  telephone: "+225 27 22 22 89 05",
  telephoneLien: "+2252722228905",
  email: "epureau@epureau-ci.com",
  horaires: "Lun – Ven · 08h30 – 17h30",
  horairesLong: "Lundi – Vendredi · 08h30 – 17h30",
  adresse: "424 Rue Koffi N'Guessan, Cité des Cadres — Cocody, Abidjan",
  boitePostale: "30 BP 835 Abidjan 30",
  maps: "https://www.google.com/maps/search/?api=1&query=Epureau+CI%2C+Abidjan",
  groupe: "SAS · Groupe YANGONDI",
  site: "www.epureau-ci.com",
};

/** Fiche d'établissement Google : l'entreprise y est référencée sous « Epureau CI ». */
export const lieuGoogle = "Epureau CI, Abidjan";

/** Comptes officiels d'EPUREAU Côte d'Ivoire, modifiables depuis Paramètres. */
export const reseaux = {
  linkedin: "https://www.linkedin.com/company/epureau-c%C3%B4te-d-ivore",
  facebook: "https://www.facebook.com/people/Epureau-CI/100067092456207/",
  youtube: "",
};

export const destinataires = [
  "epureau@epureau-ci.com",
  "jd.bogui@epureau-ci.com",
  "h.sanogo@epureau-ci.com",
];

export type NavItem = {
  label: string;
  href: string;
  sous?: { label: string; href: string; desc: string }[];
};

export const navigation: NavItem[] = [
  { label: "À propos", href: "/a-propos", sous: [
    { label: "Notre société", href: "/a-propos", desc: "Notre histoire et notre équipe" },
    { label: "Carrière", href: "/carriere", desc: "Rejoindre notre équipe" },
  ] },
  {
    label: "Ingénierie de l'eau",
    href: "/ingenierie/notre-expertise",
    sous: [
      {
        label: "Notre expertise",
        href: "/ingenierie/notre-expertise",
        desc: "Conception, réalisation, exploitation",
      },
      {
        label: "Nos réalisations",
        href: "/ingenierie/nos-realisations",
        desc: "Stations livrées en Côte d'Ivoire",
      },
    ],
  },
  { label: "Industries", href: "/service-aux-industries" },
  { label: "Hygiène institutionnelle", href: "/hygiene-institutionnelle" },
  {
    label: "Produits",
    href: "/negoce",
    sous: [
      { label: "Produits NALCO", href: "/negoce#nalco", desc: "Traitement des eaux industrielles" },
      { label: "Produits ECOLAB", href: "/negoce#ecolab", desc: "Hygiène & sécurité alimentaire" },
      {
        label: "Commodités & Réactifs",
        href: "/negoce#commodites",
        desc: "Matières premières, réactifs, matériel",
      },
    ],
  },
  {
    label: "Médiathèque",
    href: "/mediatheque",
    sous: [
      { label: "Galerie photos", href: "/mediatheque#photos", desc: "Chantiers et installations" },
      { label: "Galerie vidéos", href: "/mediatheque#videos", desc: "Films institutionnels et travaux" },
      { label: "Brochures", href: "/mediatheque#brochures", desc: "Flyers et présentation à télécharger" },
    ],
  },
  { label: "Contact", href: "/contact", sous: [
    { label: "Nous contacter", href: "/contact", desc: "Demande de cotation ou d’information" },
    { label: "Réclamation client", href: "/reclamation-client", desc: "Signaler un problème" },
  ] },
];

export const chiffres = [
  { valeur: "2015", exposant: "", legende: "Implantée en Côte d'Ivoire" },
  { valeur: "40", exposant: "+", legende: "Collaborateurs" },
  { valeur: "5", exposant: "", legende: "Stations livrées & en service" },
  { valeur: "2", exposant: "", legende: "Marques mondiales représentées" },
];

export const domaines = [
  {
    titre: "Ingénierie du traitement de l'eau",
    texte:
      "Bureau d'études, conception, réalisation et exploitation des ouvrages, en clé en main.",
    lien: "/ingenierie/notre-expertise",
    lienTexte: "Notre expertise",
    image: "/images/projets-ci/abidjan-laiterie.jpg",
    alt: "Station de traitement des eaux à Abidjan, réalisée avec EPUREAU Côte d’Ivoire",
    icone: "droplet",
  },
  {
    titre: "Service aux industries",
    texte:
      "Application de produits formulés, optimisation des utilités et services spéciaux ECOLAB F&B.",
    lien: "/service-aux-industries",
    lienTexte: "Nos services",
    image: "/images/dom-industries.jpg",
    alt: "Ligne de conditionnement industrielle",
    icone: "factory",
  },
  {
    titre: "Hygiène institutionnelle",
    texte:
      "Hôpitaux, hôtels, cuisines professionnelles, buanderies et pressings : produits, dosage et expertise.",
    lien: "/hygiene-institutionnelle",
    lienTexte: "Nos solutions",
    image: "/images/dom-hygiene.jpg",
    alt: "Buanderie professionnelle",
    icone: "sparkles",
  },
  {
    titre: "Négoce de produits chimiques",
    texte:
      "Produits NALCO, gamme ECOLAB, commodités, réactifs de laboratoire et matériel de mesure.",
    lien: "/negoce",
    lienTexte: "Nos produits",
    image: "/images/dom-negoce.jpg",
    alt: "Installation de traitement et produits",
    icone: "flask",
  },
];

export const realisations = [
  {
    slug: "eurolait",
    type: "STEP · physico-chimique",
    debit: "270",
    unite: "m³ / jour",
    nom: "EUROLAIT",
    client: "Client : EUROLAIT — Abidjan",
    texte:
      "Traitement des eaux usées d'un site industriel à forte charge, par procédé physico-chimique. Études, installation des équipements et mise en service opérationnelle.",
    image: "/maquette/images/projets/eurolait.jpg",
  },
  {
    slug: "chr-adzope",
    type: "STEP · eaux hospitalières",
    debit: "90",
    unite: "m³ / jour",
    nom: "CHR D’ADZOPÉ",
    client: "Client : AGENTIS / SEG — Adzopé",
    texte:
      "Traitement des eaux usées hospitalières d'un établissement de 200 lits, dimensionné pour répondre aux exigences sanitaires et environnementales du site.",
    image: "/maquette/images/projets/chr-adzope.jpg",
  },
  {
    slug: "pisam",
    type: "STEP modulaire · MBBR",
    debit: "60",
    unite: "m³ / jour",
    nom: "PISAM",
    client: "Client : PISAM — Abidjan",
    texte:
      "Station modulaire à procédé biologique Moving Bed Biofilm Reactor, reconnu pour sa performance et sa compacité. Études, travaux préparatoires, installation et mise en service.",
    image: "/maquette/images/projets/pisam.jpg",
  },
  {
    slug: "mipa",
    type: "STEP · SBR",
    debit: "50",
    unite: "m³ / jour",
    nom: "MIPA",
    client: "Client : MIPA — Abidjan",
    texte:
      "Procédé biologique Sequencing Batch Reactor, adapté aux effluents variables d'un site de production. Études, génie civil, équipements et mise en service.",
    image: "/maquette/images/projets/mipa.jpg",
  },
  {
    slug: "garden-center",
    type: "Prétraitement · dessablage",
    debit: "—",
    unite: "sur mesure",
    nom: "GARDEN CENTER",
    client: "Client : GARDEN CENTER — Abidjan",
    texte:
      "Ouvrages de prétraitement et de dessablage, conçus et installés pour sécuriser le rejet et faciliter l'exploitation du site.",
    image: "/maquette/images/projets/garden-center.jpg",
  },
];

export const clients = [
  "CARGILL", "EUROLAIT", "AGROCI", "S.D.T.M", "SUCRIVOIRE", "SANTA", "BRASSIVOIRE",
  "MIBEM", "CÉMOI", "Nestlé", "GOTRAF", "OLAM", "PALMCI", "PISAM", "CHR D’ADZOPÉ",
  "MIPA", "GARDEN CENTER",
];

export const etapes = [
  {
    cle: "Étape 1 — Bureau d'études",
    titre: "Conception",
    texte:
      "Le Bureau d'Études étudie et conçoit des installations répondant aux besoins du client, tout en respectant les normes en vigueur.",
    points: ["Analyse de l'effluent", "Dimensionnement", "Choix du procédé", "Conformité aux normes"],
  },
  {
    cle: "Étape 2 — Équipes de terrain",
    titre: "Réalisation",
    texte:
      "Les équipes de terrain assurent le suivi de l'ensemble des étapes inhérentes à la réalisation du projet, en gardant la maîtrise du début à la fin des travaux.",
    points: ["Travaux préparatoires", "Génie civil", "Installation des équipements"],
  },
  {
    cle: "Étape 3 — Livraison clé en main",
    titre: "Mise en service",
    texte:
      "Nous effectuons différents tests et réglages des procédés mis en œuvre afin de garantir les performances attendues. Pendant l'exploitation, nous mettons à disposition les produits NALCO et les réactifs de laboratoire nécessaires.",
    points: ["Tests & réglages", "Rejet conforme", "Suivi d'exploitation"],
  },
];

export const objetsDemande = [
  "Ingénierie du traitement de l'eau",
  "Service aux industries",
  "Hygiène institutionnelle",
  "Produits NALCO",
  "Produits ECOLAB",
  "Commodités & réactifs",
  "Autre demande",
];

export const videos = [
  { titre: "Présentation EPUREAU Côte d’Ivoire", sous: "Film institutionnel · 2026", duree: "03:10", vignette: "/images/gal-1.jpg" },
  { titre: "Travaux EPUREAU Côte d’Ivoire — chantiers en cours", sous: "Reportage de chantier · 2026", duree: "02:25", vignette: "/images/gal-2.jpg" },
  { titre: "Maîtrise de l'entretien textile", sous: "Hygiène et buanderie · 2026", duree: "01:48", vignette: "/images/gal-3.jpg" },
];

export const brochures = [
  { titre: "Présentation EPUREAU Côte d’Ivoire", sous: "Plaquette institutionnelle complète — 29 pages", taille: "PDF · 1,8 Mo", fichier: "" },
  { titre: "Portfolio des réalisations", sous: "Nos stations livrées et mises en service", taille: "PDF · 3,1 Mo", fichier: "" },
  { titre: "Flyer — Secteur industriel", sous: "Solutions et services pour l'industrie", taille: "PDF · 0,5 Mo", fichier: "" },
  { titre: "Flyer — Secteur institutionnel", sous: "Hygiène des établissements et collectivités", taille: "PDF · 0,4 Mo", fichier: "" },
];

/**
 * Fiches produits de départ (page « Négoce »). Familles génériques, sans référence
 * commerciale inventée : EPUREAU les renomme, les complète ou les supprime depuis
 * l'administration, et en ajoute autant que nécessaire.
 */
export const produits = [
  {
    slug: "nalco-eaux-de-chaudiere",
    nom: "Traitement des eaux de chaudière",
    marque: "NALCO",
    gamme: "Utilités vapeur",
    usage: "Conditionnement de l'eau d'alimentation, protection contre l'entartrage et la corrosion, traitement des condensats.",
    secteurs: "Agroalimentaire, boissons, industries de process",
    forme: "Liquide, bidons et fûts · dosage automatique",
    points: "Rendement vapeur maintenu\nDurée de vie des équipements\nSuivi analytique sur site",
    image: "",
    texte: "Programme complet de conditionnement des eaux de chaudière : produits NALCO WATER, plan d'analyse, réglage du dosage et accompagnement des équipes d'exploitation.",
  },
  {
    slug: "nalco-tours-aerorefrigerantes",
    nom: "Tours aéroréfrigérantes et circuits fermés",
    marque: "NALCO",
    gamme: "Utilités froid",
    usage: "Maîtrise de l'entartrage, de la corrosion et du développement microbiologique des circuits de refroidissement.",
    secteurs: "Industries, agroalimentaire, tertiaire technique",
    forme: "Liquide · dosage proportionnel ou asservi",
    points: "Échanges thermiques préservés\nConsommation d'eau maîtrisée\nContrôle microbiologique",
    image: "",
    texte: "Traitement des eaux de refroidissement et suivi des paramètres clés, avec audits de performance et rapports périodiques.",
  },
  {
    slug: "nalco-coagulants-floculants",
    nom: "Coagulants, floculants et antimousses",
    marque: "NALCO",
    gamme: "Eaux usées et process",
    usage: "Clarification, déshydratation des boues, neutralisation et réduction des mousses en station d'épuration.",
    secteurs: "Stations d'épuration industrielles et municipales",
    forme: "Liquide et poudre · essais de laboratoire préalables",
    points: "Essai jar-test avant sélection\nSiccité des boues améliorée\nRejets conformes",
    image: "",
    texte: "Sélection du réactif après essais sur votre effluent, puis optimisation des doses en exploitation.",
  },
  {
    slug: "ecolab-programmes-cip",
    nom: "Programmes de nettoyage CIP et COP",
    marque: "ECOLAB",
    gamme: "Food & Beverage",
    usage: "Nettoyage et désinfection en place des circuits, cuves et équipements de production.",
    secteurs: "Laiteries, brasseries, boissons, agroalimentaire",
    forme: "Détergents alcalins et acides, désinfectants · postes de dosage",
    points: "Conformité HACCP / ISO 22000\nTemps de cycle maîtrisés\nTraçabilité des opérations",
    image: "",
    texte: "Programmes d'hygiène ECOLAB adaptés à vos lignes, avec plan de nettoyage, dosage automatique et formation des opérateurs.",
  },
  {
    slug: "ecolab-lavage-bouteilles",
    nom: "Lavage de bouteilles et lubrification des convoyeurs",
    marque: "ECOLAB",
    gamme: "Food & Beverage",
    usage: "Lavage des contenants consignés et lubrification des lignes d'embouteillage.",
    secteurs: "Embouteillage, brasseries, boissons",
    forme: "Additifs de lavage et lubrifiants · dosage en ligne",
    points: "Cadence de ligne préservée\nConsommation d'eau réduite\nUsure des convoyeurs limitée",
    image: "",
    texte: "Solutions dédiées aux lignes d'embouteillage : réglage du dosage, suivi de consommation et audits d'hygiène.",
  },
  {
    slug: "ecolab-hygiene-surfaces",
    nom: "Hygiène des surfaces et des locaux",
    marque: "ECOLAB",
    gamme: "Hygiène institutionnelle",
    usage: "Nettoyage et désinfection des sols, surfaces, cuisines professionnelles et sanitaires.",
    secteurs: "Hôtellerie, restauration, santé, collectivités",
    forme: "Concentrés · centrales de dilution",
    points: "Protocoles par zone\nDilution maîtrisée\nFormation des équipes",
    image: "",
    texte: "Gamme d'hygiène pour les établissements recevant du public, avec plan de nettoyage et matériel de dosage.",
  },
  {
    slug: "commodites-sel-pastilles",
    nom: "Sel en pastilles pour adoucisseurs",
    marque: "Commodités & Réactifs",
    gamme: "Matières premières",
    usage: "Régénération des résines échangeuses d'ions des adoucisseurs.",
    secteurs: "Industries, hôtellerie, buanderies",
    forme: "Sacs de 25 kg · palettes",
    points: "Qualité alimentaire\nLivraison sur site\nApprovisionnement régulier",
    image: "",
    texte: "Approvisionnement régulier en sel de régénération, livré sur site avec suivi des consommations.",
  },
  {
    slug: "commodites-reactifs-laboratoire",
    nom: "Réactifs et matériel de laboratoire",
    marque: "Commodités & Réactifs",
    gamme: "Analyse et contrôle",
    usage: "Contrôle quotidien des paramètres d'exploitation : pH, conductivité, chlore, dureté, turbidité.",
    secteurs: "Tous secteurs équipés d'un laboratoire de site",
    forme: "Réactifs, verrerie, analyseurs portatifs et en ligne",
    points: "Analyseurs portatifs et en ligne\nConsommables disponibles\nMise en service assurée",
    image: "",
    texte: "Acides, bases, réactifs d'analyse, verrerie et instruments de mesure, avec mise en service et formation à l'utilisation.",
  },
];

export const galerie = [
  { image: "/images/gal-1.jpg", legende: "Chantier · terrassement" },
  { image: "/images/gal-2.jpg", legende: "PISAM · pose des cuves" },
  { image: "/images/gal-4.jpg", legende: "CHR D’ADZOPÉ · unité EPUREAU Côte d’Ivoire" },
  { image: "/images/gal-5.jpg", legende: "MIPA · équipements de process" },
  { image: "/images/gal-6.jpg", legende: "PISAM · espaces paysagers" },
  { image: "/images/gal-3.jpg", legende: "EUROLAIT · local technique" },
];

export const diapositives = [
  {
    surtitre: "Experts en ingénierie du traitement de l'eau",
    titre: "Des solutions fiables",
    titreAccent: "pour votre satisfaction.",
    texte:
      "Conception et réalisation de stations de traitement des eaux, service aux industries et hygiène institutionnelle. Distributeur des marques NALCO et ECOLAB en Côte d'Ivoire et dans la sous-région.",
    image: "/images/hero-1.jpg",
    alt: "Station de traitement des eaux réalisée par EPUREAU Côte d’Ivoire",
    actions: [
      { label: "Demander une cotation", href: "/contact", primaire: true, icone: "arrow" },
      { label: "Notre présentation", href: "/mediatheque#brochures", primaire: false, icone: "download" },
    ],
  },
  {
    surtitre: "Ingénierie du traitement de l'eau",
    titre: "De la conception à l'exploitation,",
    titreAccent: "toute la chaîne.",
    texte:
      "Le Bureau d'Études conçoit, les équipes de terrain réalisent, et nous livrons des unités de traitement clé en main : eaux potables, usées et industrielles.",
    image: "/images/hero-2.jpg",
    alt: "Pose des ouvrages de traitement sur chantier",
    actions: [
      { label: "Notre expertise", href: "/ingenierie/notre-expertise", primaire: true, icone: "arrow" },
      { label: "Nos réalisations", href: "/ingenierie/nos-realisations", primaire: false, icone: "" },
    ],
  },
  {
    surtitre: "Service aux industries",
    titre: "Vous produisez, nous optimisons",
    titreAccent: "vos utilités et votre hygiène.",
    texte:
      "Distributeur des marques ECOLAB et NALCO : le bon dosage et les bonnes pratiques pour réduire vos coûts de production et assurer l'hygiène de vos installations.",
    image: "/images/hero-3.jpg",
    alt: "Ligne de conditionnement dans une industrie agroalimentaire",
    actions: [{ label: "Nos services", href: "/service-aux-industries", primaire: true, icone: "arrow" }],
  },
  {
    surtitre: "Hygiène institutionnelle",
    titre: "Des solutions complètes d'hygiène",
    titreAccent: "pour les établissements exigeants.",
    texte:
      "Hôpitaux, buanderies, pressings, hôtels, cuisines professionnelles et restaurants : produits haute performance, équipements de dosage et expertise technique.",
    image: "/images/hero-4.jpg",
    alt: "Buanderie professionnelle équipée par EPUREAU Côte d’Ivoire",
    actions: [{ label: "Nos solutions", href: "/hygiene-institutionnelle", primaire: true, icone: "arrow" }],
  },
];
