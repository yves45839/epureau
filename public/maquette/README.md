# Maquette EPUREAU — accueil

Archive interactive de la maquette validée, désormais intégrée à l’accueil du site dans `src/components/HomeLanding.tsx`. La page réelle utilise le formulaire connecté à `/api/cotation` et le composant historique `Footer`. Ouvrir `index.html` via le serveur local pour basculer entre ordinateur et mobile. `accueil.html` permet la lecture en plein écran.

Parcours : ouverture avec message fixe → quatre métiers → réalisations → clients et marques représentées → contact. Les liens des pages complémentaires ouvrent le site existant. Les cartes métiers ouvrent une présentation et préparent le bon domaine dans le formulaire de démonstration. Aucun envoi de formulaire ni appel à une API.

Animations : légère arrivée de la photo d'ouverture ; déploiement des quatre cartes métiers en profondeur, fixé temporairement lorsque l'écran permet de voir toutes les cartes ; séquence de réalisations avec photos fixes et transition entre les deux premiers cas, suivie des trois autres projets. Le défilement mobile reste naturel avec une apparition plus marquée des cartes. Le réglage système de réduction des mouvements est respecté.

## Visuels

Les images sont employées une seule fois visuellement par format. Les cinq projets du catalogue sont présents : EUROLAIT, CHR d'Adzopé, PISAM, MIPA et GARDEN Center. Les photos sont extraites sans modification du catalogue de `Proposition EPUREAU/Maquette_EPUREAU_Immersion.html`, d'après les associations explicites des attributs alt dans la section des réalisations. Elles sont enregistrées dans `images/projets`, toutes en 640 × 245 pixels. Cette association corrige les correspondances incohérentes des noms de fichiers de certaines anciennes images du dépôt. Les données des projets sont confirmées par `src/content/site.ts`, le cahier des charges v2 p.11 et la présentation DG v3 p.10.

Les six logos clients et les deux logos des marques représentées proviennent des sources documentées dans `images/logos/SOURCES.json`. Leur nom apparaît au survol, au focus clavier et après toucher/clic. Les logos ne sont pas générés. Les fichiers restent locaux à la maquette, sans requête à un fournisseur de logos tiers à l'affichage.

Le panorama, les ingénieurs, l'industrie et la buanderie sont les illustrations générées déjà documentées dans `assets/illustrations` à la racine du dépôt.

La nouvelle illustration `images/produits.webp` a été créée avec image_gen le 10 septembre 2026. Dimensions natives : 1672 × 941 px ; export WebP qualité 86, 72 880 octets, sans agrandissement. Elle ne représente pas un stock réel EPUREAU. L'original reste dans le dossier de génération de la session. La version de travail est copiée avec la maquette.

Prompt exact :

```text
Use case: photorealistic-natural
Asset type: professional website card photograph for the “Produits chimiques” section of an EPUREAU Côte d’Ivoire design mockup.
Primary request: Generate exactly one high-resolution horizontal photograph, 16:9 aspect ratio, 2048 x 1152 or larger, of a neat row of clean closed white industrial chemical jerrycans and a few securely capped laboratory reagent bottles, with dosing and measurement instruments on a clean light-colored workbench.
Scene/backdrop: A bright, tidy and plausible professional chemical storage and preparation room in Côte d’Ivoire, with restrained shelves in the background. This is a fictional illustrative scene, not documentation of real EPUREAU stock.
Subject: White industrial HDPE chemical jerrycans with closed caps, a few capped reagent bottles, a small dosing pump and measurement instruments resting on the bench. No chemical mixing is occurring.
Style/medium: Sober documentary photography, naturally detailed, sharp and convincing, clean professional appearance.
Composition/framing: Landscape 16:9, eye-level three-quarter angle, objects grouped clearly as the main subject, modest depth of field and enough contextual background for a service card. No people.
Lighting/mood: Soft natural daylight, bright and calm.
Color palette: White and pale neutral surfaces, restrained cyan and navy details on caps or equipment.
Constraints: All containers must be closed and chemically plausible. No brand, logo, watermark or readable text. No food or beverage bottles. No liquid pouring, splashing, mixing or open chemical containers. No people. Avoid stainless-steel factory machinery, water engineers, laundry scenes and aerial views. One image only.
```
