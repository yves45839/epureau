# Administration EPUREAU Côte d’Ivoire

## Ce qui est livré

- Espace /admin en français, adapté à l’ordinateur et au mobile.
- Pages existantes : textes, images, brouillons, aperçu privé, publication et blocs supplémentaires.
- Réalisations : création, modification, ordre, publication, retrait.
- Médiathèque : images, albums, import multiple par glisser-déposer ; vidéos par URL HTTPS (fichier ou YouTube).
- Brochures PDF avec URL stable /api/brochures/identifiant : remplacer le fichier ne change pas cette adresse.
- Cotations et réclamations : recherche, filtre par mois/statut, affectation, notes et historique, export CSV ouvrable dans Excel.
- Comptes administrateur, éditeur et commercial ; activation/désactivation, changement de mot de passe.
- Paramètres : coordonnées, destinataires des notifications, liens sociaux, textes légaux et activation du blog.
- Journal des connexions et modifications. Sessions révocables avec expiration serveur à 12 heures.
- Inscription des collaborateurs réservée aux adresses @epureau-ci.com, avec activation par un administrateur.
- Audience : fréquentation, provenance, localisation, appareils et conversions, mesurées par le site lui-même.

## Essayer gratuitement sur cet ordinateur

Depuis le dossier epureau :

```powershell
npm run admin:local
```

Ouvrir http://127.0.0.1:3000/admin. Le premier lancement crée un mot de passe aléatoire dans .env.local s’il n’existe pas. Lire ADMIN_EMAIL et ADMIN_PASSWORD dans ce fichier privé. Ne pas les envoyer par messagerie ni les déposer dans Git.

Les données sont conservées dans .local/admin.json et les médias dans .local/media. Ce mode est désactivé automatiquement chez Vercel et Netlify. Il sert à la démonstration et au développement sur un seul processus ; ne pas l’utiliser comme stockage partagé en production.

## Publier un contenu

1. Choisir la rubrique puis le contenu.
2. Modifier les champs. Les URL d’images peuvent être remplacées par un téléversement.
3. Enregistrer le brouillon.
4. Ouvrir Aperçu. La barre orange confirme que seuls les utilisateurs autorisés voient les brouillons.
5. Cliquer Publier. La version publique est mise à jour sans redéploiement.

Un message de conflit empêche d’écraser une modification faite par un autre administrateur. Recharger alors le contenu et reporter les changements.

Les photos et PDF sont limités à 4 Mo chacun pour maîtriser le stockage et rester compatibles avec les fonctions d’hébergement. Les vidéos restent hébergées sur un service vidéo ou derrière une URL de fichier HTTPS ; elles ne consomment pas le quota de téléversement d’images.

## Comptes et accès

- Administrateur : toutes les rubriques.
- Éditeur : pages, projets, médias, brochures et blog.
- Commercial : demandes, affectations, notes, statuts et export.

Le compte principal est défini par ADMIN_EMAIL et ADMIN_PASSWORD. Il ne peut pas être supprimé dans l’interface. Les autres mots de passe sont salés et hachés avec scrypt. La désactivation prend effet sur les requêtes suivantes ; un changement de mot de passe révoque les sessions du compte.

### Inscription des collaborateurs

La page /admin/inscription permet à un collaborateur de créer lui-même son compte. Les règles appliquées côté serveur :

- Seules les adresses du domaine **@epureau-ci.com** sont acceptées, ainsi que la ou les adresses de super administration listées dans ADMIN_SUPER_EMAILS (par défaut roland@label-ci.com).
- Le compte est créé **inactif**, avec le rôle **Commercial** : il n’ouvre l’administration qu’après passage de « Compte actif » à « oui » par un administrateur, dans la rubrique Utilisateurs.
- Mot de passe de 12 caractères minimum, salé et haché ; jamais stocké en clair, jamais envoyé par e-mail.
- Cinq demandes par heure et par adresse au maximum. Une adresse déjà enregistrée reçoit la même réponse qu’une nouvelle, pour ne pas révéler l’existence d’un compte.
- Chaque demande est tracée dans le Journal des accès.

### Super administrateur

Les adresses de ADMIN_SUPER_EMAILS sont les propriétaires du site :

- La première inscription d’une de ces adresses, tant qu’aucun compte administrateur actif n’existe, crée directement un compte **Administrateur actif** : c’est la mise en service initiale. Ensuite, une nouvelle demande de ce type repasse par la file d’attente comme les autres.
- Leur compte ne peut être ni modifié ni désactivé par un autre administrateur.
- Elles peuvent aussi ouvrir une session de secours avec ADMIN_PASSWORD tant qu’aucun compte ne leur est associé.

## Audience (mesure de fréquentation)

La rubrique **Audience** de l’administration répond aux exigences ET-19 et EF-30 du cahier des charges, sans outil tiers ni abonnement.

- Ce qui est mesuré : pages vues, visiteurs, sessions, durée moyenne, pages par session, taux de rebond, pages d’entrée et de sortie, sources de trafic (accès direct, recherche, réseaux sociaux, sites référents), pays et ville, appareil, navigateur, système, et les conversions (demande de cotation, réclamation, téléchargement de brochure). Périodes : 7, 30, 90 ou 365 jours.
- Ce qui n’est pas conservé : **aucune adresse IP**. L’IP et l’agent du navigateur servent uniquement à calculer une empreinte anonyme avec un sel tiré au hasard et **renouvelé chaque jour** ; le sel de la veille est détruit, donc deux visites séparées par un jour ne peuvent plus être reliées. Aucun cookie n’est déposé et aucune donnée ne sort du site.
- Les robots d’indexation sont exclus du comptage. Les visiteurs peuvent refuser la mesure depuis le bandeau de consentement, et modifier leur choix à tout moment par le lien « Gérer les cookies » du pied de page. L’en-tête « Do Not Track » du navigateur est respecté.
- Les données sont stockées dans la table audience_events de la base du site et purgées automatiquement au-delà de 400 jours.

## Budget : zéro abonnement, sous quotas

Offres vérifiées le 15 septembre 2026 :

- Netlify Free : 300 crédits/mois, limite bloquante sans dépassement facturé ; usage commercial autorisé. Les crédits couvrent notamment les déploiements, les requêtes, le trafic et le calcul.
- Supabase Free : 500 Mo de base, 1 Go de fichiers et quotas de transfert. Pause possible après une semaine d’inactivité. Pas de sauvegardes automatiques incluses.
- E-mails : la configuration Resend existante reste optionnelle. Sans clé, les demandes sont conservées dans le tableau de bord mais aucune notification e-mail n’est envoyée. Si Resend est activé, rester sur son forfait gratuit et surveiller son quota.
- Un domaine personnalisé déjà acheté garde son coût de renouvellement chez son fournisseur. Les sous-domaines gratuits de l’hébergeur permettent de ne pas acheter de nouveau domaine.

La gratuité n’est pas une promesse de ressources illimitées ni de disponibilité garantie. Une limite gratuite atteinte peut rendre le service indisponible jusqu’au renouvellement du quota ou à une action manuelle. Aucun abonnement payant n’est activé par le code.

Sources :
https://www.netlify.com/pricing/
https://www.netlify.com/blog/introducing-netlify-free-plan/
https://supabase.com/pricing

## Mise en ligne gratuite

1. Créer/choisir un compte Netlify sur le forfait Free, sans activer d’option payante.
2. Créer un projet Supabase Free.
3. Dans l’éditeur SQL Supabase, exécuter supabase/setup.sql pour préparer la table privée et le bucket. Autrement, créer le bucket public site-media, avec limite 4194304 octets et types image/jpeg, image/png, image/webp, application/pdf. Ne pas ajouter de politique d’écriture publique. Ce bucket sert uniquement aux médias destinés au site public, jamais aux CV ou pièces privées.
4. Définir les variables serveur décrites dans .env.example. Utiliser la chaîne PostgreSQL du pooler Supabase et un rôle serveur autorisé à accéder aux tables ; ne jamais exposer DATABASE_URL ni SUPABASE_SECRET_KEY ni SUPABASE_SERVICE_ROLE_KEY dans une variable NEXT_PUBLIC_*.
5. Importer le dépôt GitHub existant dans Netlify. Le fichier netlify.toml configure la compilation Next.js. La racine du projet est le dossier contenant package.json.
6. Ne pas définir ADMIN_LOCAL_STORE chez l’hébergeur.
7. Tester sur l’URL de préproduction : connexion, brouillon/aperçu/publication, téléversement et réception d’une demande.
8. Raccorder le domaine après validation. Préserver les enregistrements MX et les enregistrements de messagerie.
9. Vérifier les compteurs d’usage des forfaits Free. Ne pas activer de recharge ni changer de forfait.

Les tables d’administration sont créées automatiquement à la première connexion et ont la sécurité par ligne activée, sans politique d’accès anonyme. Les anciennes cotations de la table demandes sont reprises dans l’administration sans être supprimées.

## Sauvegardes et réversibilité

En local, arrêter le serveur puis copier le dossier .local dans une sauvegarde privée.
En production, effectuer un export PostgreSQL régulier avec pg_dump et télécharger les médias du bucket. Supabase Free ne fournit pas de sauvegardes automatiques : leur organisation reste nécessaire. Tester la restauration sur un projet séparé avant de considérer la procédure comme validée. Le code, les fichiers et les données PostgreSQL sont transférables vers un autre hébergeur.

## Éléments à activer côté comptes

Le code ne crée pas de compte, ne souscrit aucun abonnement et ne migre pas le domaine. La base, le bucket et les variables doivent être configurés sur les comptes du propriétaire. Une activation en ligne n’est confirmée qu’après un test réel sur l’hébergement.

## Vérification technique

Tests unitaires : npm test. Contrôle du code : npm run lint -- --quiet. Compilation : npm run build.
La suite node scripts/admin-integration.mjs nécessite le serveur npm run admin:local. Elle utilise uniquement 127.0.0.1, crée des données TEST, désactive les comptes de test et restaure la page modifiée. Le lancement local désactive les e-mails sortants.

## Connexion guidée depuis le terminal

Exécuter node scripts/connect-supabase.mjs dans PowerShell. Le script demande la chaîne Transaction pooler avec [YOUR-PASSWORD], le mot de passe PostgreSQL et la Secret key sb_secret_... (ou l’ancienne clé service_role). L’URL du projet est déduite automatiquement de la chaîne PostgreSQL. Les erreurs de saisie de la chaîne et de la clé permettent de réessayer sans quitter. Les secrets sont saisis sans affichage. Il vérifie PostgreSQL avant de mettre à jour .env.local, conserve le compte administrateur et lance le site sur http://127.0.0.1:3001/admin avec les notifications e-mail désactivées pour cet essai. Les données de démonstration ne sont pas migrées. Cette commande configure le poste local ; les mêmes variables serveur devront être ajoutées chez l’hébergeur pour la mise en ligne.

## Projet Vercel existant

Le projet epureau, dans samr45839s-projects, est relié à la branche main de yves45839/epureau. Son adresse est https://epureau.vercel.app ; l’administration est accessible sur /admin.

Avant de pousser le code sur main, renseigner dans les variables de production Vercel : DATABASE_URL, SUPABASE_URL, SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY), ADMIN_EMAIL et ADMIN_PASSWORD. Stocker les secrets comme variables sensibles. ADMIN_LOCAL_STORE doit être absent ou valoir 0. Ne jamais envoyer .env.local ni .local dans Git. Préserver les éventuels paramètres e-mail existants.

Le push sur main déclenche le déploiement GitHub/Vercel. Attendre le statut Ready, puis vérifier le site et la connexion administrateur. La commande node scripts/verify-supabase.mjs --production teste l’accès administrateur et le téléversement sur epureau.vercel.app avec les accès locaux ; elle retire son image de contrôle et n’envoie aucun e-mail.

Aucun changement de forfait n’est effectué par cette procédure. Le plan Hobby de Vercel est réservé à un usage personnel non commercial : pour un site d’entreprise sans abonnement, la solution Netlify Free décrite ci-dessus reste l’alternative.

## Éditeur visuel des pages

Dans Pages du site, choisir une page puis utiliser Composition de la page. La poignée permet de déplacer une section à la souris ; les boutons Monter et Descendre permettent la même opération au clavier ou sur mobile. Retirer la section agit sur le brouillon ; les sections d’origine restent disponibles dans Réinsérer une section d’origine. Les animations de ces sections restent celles du site existant.

Sept composants peuvent être ajoutés : texte et image, grande image, appel à l’action, cartes, galerie, carrousel et questions fréquentes. Les éléments des galeries, cartes, carrousels et FAQ sont modifiables et réordonnables. Les carrousels disposent de commandes manuelles et d’une lecture automatique optionnelle, suspendue hors écran, au survol et lorsque les mouvements sont réduits. Aucun code HTML ou JavaScript libre n’est accepté.

Créer une page demande un titre et une adresse telle que notre-engagement. L’adresse ne peut pas remplacer une route réservée et reste fixe après enregistrement. Les pages créées peuvent être publiées, dépubliées, supprimées dans la corbeille et restaurées en brouillon. Les onze pages principales restent disponibles ; leurs sections peuvent être retirées ou réorganisées. Une option permet d’afficher un lien vers une nouvelle page dans le pied de page. Seules les pages publiées apparaissent dans le sitemap public.

Enregistrer le brouillon, ouvrir Aperçu, puis Publier. L’aperçu exige une session administrateur ou éditeur ; partager son URL ne rend pas le brouillon public. Une modification simultanée est refusée pour éviter de remplacer le travail d’un autre éditeur. Les compositions acceptent au maximum 40 sections par page et 20 éléments par composant. Les anciens blocs supplémentaires sont repris sans perte.

Tests : npm test. La suite scripts/page-builder-integration.mjs est réservée au serveur local de vérification sur 127.0.0.1:3002 avec ADMIN_LOCAL_STORE=1, ADMIN_LOCAL_DATASET=builder-test, DATABASE_URL vide et une configuration privée .local/builder-test-env.json. Elle utilise .local/builder-test.json, séparé des données locales habituelles et de Supabase. EPUREAU_BUILD_DIR permet d’isoler la compilation de test dans .local.

## Traduction français → anglais dans Chrome

Dans un contenu de l’administration (page, produit, réalisation, média, brochure, article ou paramètres), le panneau **Version anglaise** permet de :

1. Cliquer sur **Traduire les textes nouveaux ou modifiés** dans Chrome sur ordinateur, avec une connexion HTTPS (ou localhost en développement).
2. Attendre le téléchargement initial du modèle FR → EN et la fin de la traduction. Aucun abonnement, clé API ni moteur serveur n’est nécessaire. Chrome peut refuser la fonctionnalité selon sa version, les politiques du poste et la disponibilité du modèle ; le panneau indique alors la saisie manuelle.
3. Ouvrir **Relire et corriger l’anglais**, puis **Enregistrer le brouillon**.
4. Consulter **Aperçu EN**, puis **Publier** pour rendre les traductions accessibles aux visiteurs. Le bouton de traduction ne publie rien.

Le moteur ne traduit que les champs textuels et les textes des blocs. Les liens, images, numéros de téléphone, e-mails, adresses et identifiants des blocs restent inchangés. La traduction se fait sur l’ordinateur ; les textes français et anglais sont ensuite envoyés au stockage habituel du site lors de l’enregistrement. Aucune modification du schéma Supabase n’est nécessaire.

Les traductions sont conservées dans `__en` au sein des données brouillon/publiées existantes. Chaque entrée conserve le français correspondant et indique si l’anglais a été corrigé manuellement. Une correction manuelle n’est jamais remplacée par le bouton automatique. Si son français change, elle est signalée à relire : valider la correction ou l’effacer pour autoriser une nouvelle traduction. Les traductions attachées aux blocs suivent leurs identifiants, même lorsque les blocs sont déplacés.

Les visiteurs choisissent FR / EN. Les adresses `/fr/...` et `/en/...` servent les mêmes pages dans la langue choisie. Un cookie fonctionnel `epureau-language` mémorise le choix pendant un an. Les API et l’administration ne changent pas de langue. Seuls les textes anglais publiés et correspondant encore au français actuel sont affichés ; les textes manquants ou obsolètes restent en français. Il faut donc traduire et publier les contenus existants une première fois. Les principaux libellés fixes de navigation et de formulaire disposent d’un dictionnaire anglais local (`src/content/ui-english.ts`).

### Vérification locale des traductions

- `node --test scripts/translations.test.mjs` : filtrage des champs, blocs, corrections manuelles, données invalides, textes longs et annulation avec moteur simulé.
- `node scripts/translations-integration.mjs` : instance **locale uniquement** sur `http://localhost:3118`, démarrée avec `ADMIN_LOCAL_STORE=1`, `ADMIN_LOCAL_DATASET=translation-test`, `ADMIN_EMAIL=translation-test@epureau-ci.com`, `ADMIN_PASSWORD=Translation-local-test-2026!`, `DATABASE_URL` et `RESEND_API_KEY` vides. Ces identifiants de test ne doivent jamais être utilisés pour un déploiement. Le test crée uniquement des données dans `.local/translation-test.json` : brouillon privé, aperçu EN, publication FR/EN, langue mémorisée, conflit de révision et dépublication.
- La validation du téléchargement et de la qualité réelle du modèle exige Chrome sur ordinateur : ce contrôle ne peut pas être remplacé par un moteur simulé.

Documentation du moteur : https://developer.chrome.com/docs/ai/translator-api


### Catalogue et fiches produits

La page `/negoce` regroupe les produits par catégorie, avec recherche, filtre de marque et filtre de catégorie. Chaque produit publié dispose d’une page `/negoce/<identifiant>`. Un brouillon reste visible uniquement dans l’aperçu administrateur. Les boutons « Demander un devis » ouvrent le formulaire avec le produit renseigné.

Dans **Produits**, renseignez la catégorie, la référence fabricant et, si disponible, un document PDF HTTPS (ou importez un PDF). Choisissez **Fiche technique** ou **Brochure fabricant** et sa langue. Aucun prix n’est affiché. Les textes peuvent être traduits depuis le panneau Version anglaise ; les références et liens ne sont pas traduits.

Le lien documentaire est révélé après saisie d’un e-mail valide et enregistrement réussi dans **Demandes & réclamations**, source `fiche-produit`. Il n’est pas inclus dans le HTML ni les données initiales envoyées au navigateur. Supabase/DATABASE_URL ou le stockage local doit fonctionner ; une panne ne produit pas un faux succès. Il s’agit d’un formulaire de collecte, sans vérification de propriété de l’e-mail ni abonnement marketing. Le document s’ouvre sur le site fabricant ; aucun e-mail automatique n’est envoyé au demandeur.

Sans PDF, la demande reste enregistrée pour traitement par l’équipe. Pour une brochure, elle est disponible immédiatement et le suivi demande explicitement la fiche technique complémentaire. Les fichiers publics du fabricant ou du stockage restent des fichiers publics : ce parcours n’est pas un système de protection de documents confidentiels.

Quatre exemples réels sont ajoutés sans remplacer les contenus déjà enregistrés : 3D TRASAR 3DT230, 3D TRASAR Boiler Premium, MAXX Magic2 et Topax Duo. Leurs textes FR/EN sont préremplis. Documents régionaux : disponibilité locale et conditionnements à confirmer avant toute offre. Sources fabricant vérifiées le 24 septembre 2026 :

- [NALCO 3DT230 — bulletin produit](https://www.ecolab.com/-/media/Ecolab/Ecolab-Home/Documents/DocumentLibrary/Asia-Pacific/Korea/Product-pages/3DT230-pdf.pdf?la=en)
- [NALCO Boiler Premium — spécifications](https://assets.pim.ecolab.com/media/Original/10000/SPEC-772%203D_TRASAR_Boilers_Premium.pdf)
- [ECOLAB MAXX Magic2 — fiche produit](https://en-uk.ecolab.com/-/media/Widen/Institutional/Buildings--Facilities/MAXX_MAGIC2_Sellsheet_EU-EN_pdf.pdf)
- [ECOLAB Topax Duo — présentation fabricant](https://en-sg.ecolab.com/offerings/topax-duo-and-topax-duo-plus) et [brochure](https://en-sg.ecolab.com/-/media/Ecolab/Ecolab-Home/Documents/DocumentLibrary/F-and-B/Topax-Duo-Sell-Sheet-pdf.pdf).


### Carte interactive de l’accueil

Dans **Pages du site → Accueil → Carte interactive des secteurs**, modifiez le titre, l’introduction et, pour chacun des six secteurs, le titre, le descriptif, les solutions et le lien métier. La section occupe l’ancien emplacement `section-2` sous le carrousel, sans décaler les autres sections. Si elle avait été retirée dans une composition enregistrée, réajoutez « Carte interactive des secteurs » dans le constructeur de pages. Les brouillons et traductions suivent le fonctionnement habituel de l’administration.

Les six secteurs et leurs contenus sont adaptés des pages 2 et 3 de la plaquette fournie. La ville est une illustration vectorielle schématique, sans géolocalisation ni service de cartographie externe. La sélection fonctionne au clic, au toucher et au clavier. Le bouton « Parler de mon projet » préremplit le secteur dans le formulaire de contact.

Le PDF original de quatre pages est conservé sans modification dans `public/brochures/epureau-plaquette.pdf` : consultation intégrée à la demande, ouverture dans un nouvel onglet et téléchargement. Le PDF reste en français ; les contenus interactifs ont une version anglaise. Il ne se charge qu’à l’ouverture du lecteur.

La carte propose des microanimations SVG/CSS (grues, fumée, bassins, tambours), un bouton de pause et des réactions au survol. Les boucles sont suspendues hors écran et désactivées si le visiteur préfère réduire les mouvements. Aucun moteur 3D ni service externe supplémentaire n’est chargé.
