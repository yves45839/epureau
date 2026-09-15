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
