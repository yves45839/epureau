# EPUREAU Côte d’Ivoire — état du projet et prochaines étapes

_Mis à jour le 18 septembre 2026. Référence : cahier des charges v2.0 du 30/07/2026 (52 exigences : 31 fonctionnelles, 21 techniques)._

---

## 1. Livré le 18 septembre 2026

| Sujet | Exigences couvertes | Détail |
|---|---|---|
| Mesure d’audience interne | ET-19, EF-30 | Rubrique **Audience** : pages vues, visiteurs, sessions, durée, rebond, pages d’entrée et de sortie, sources, pays et ville, appareils, navigateurs, conversions, 25 dernières visites. Périodes 7 / 30 / 90 / 365 jours. Aucun cookie, aucune donnée transmise à un tiers, **adresse IP jamais enregistrée** (empreinte anonyme dérivée d’un sel renouvelé chaque jour), robots exclus, « Do Not Track » respecté, purge au-delà de 400 jours. Table `audience_events`, créée automatiquement. |
| Bandeau de consentement | EF-29 | Accepter / Refuser / Personnaliser, choix conservé sur le poste du visiteur, modifiable par « Gérer les cookies » en pied de page. |
| Inscription des collaborateurs | EF-25 | `/admin/inscription` réservée aux adresses **@epureau-ci.com**. Compte créé **inactif**, rôle **Commercial**, activé par un administrateur. Mot de passe ≥ 12 caractères salé et haché, 5 demandes/heure/adresse, aucune divulgation d’un compte existant, demande tracée au journal. |
| Super administrateur | — | `ADMIN_SUPER_EMAILS` (défaut `roland@label-ci.com`). Première inscription = compte administrateur actif tant qu’aucun autre n’existe ; ensuite file d’attente normale. Compte non modifiable par un autre administrateur ; connexion de secours par `ADMIN_PASSWORD`. |
| Contact : réseaux et carte | EF-21 | LinkedIn et Facebook en pastilles logo (page contact + pied de page), carte Google Maps de l’établissement **Epureau CI**, chargée à la demande pour ne rien transmettre à Google sans action du visiteur. |
| Fiches produits | hors CDC (à valider) | Rubrique **Produits** dans l’administration : ajout, modification, brouillon, aperçu, publication, dépublication, suppression, ordre. Attributs : nom, marque (NALCO / ECOLAB / Commodités & Réactifs), gamme, application, secteurs, conditionnement, points clés, visuel, description. Affichage par marque sur `/negoce`, sans prix ni panier (EF-10 respecté). **8 fiches de départ génériques** — aucune référence commerciale réelle. |
| Tableau de bord d’administration | ergonomie (chap. 5.5) | Navigation groupée (Pilotage, Relation client, Contenus, Administration) avec icônes, compteurs d’alerte et tiroir mobile ; en-tête collant avec action principale contextuelle ; accueil refait : indicateurs, courbe 14 jours, file « À traiter », dernières demandes, contenus en ligne, activité récente, raccourcis. Charte alignée sur le marine/cyan EPUREAU. |

Vérifications : types sans erreur, **38 tests automatisés au vert**, build de production complet (31 routes), chaîne produits (ajout → publication → modification → suppression) et chaîne inscription/audience éprouvées de bout en bout.

---

## 2. Point d’attention : la chaîne de réception des demandes

Aujourd’hui, un envoi de formulaire déclenche deux canaux :

- **Enregistrement en base Supabase** → visible dans « Demandes & réclamations » et sur le tableau de bord. **Actif.**
- **Notification e-mail aux trois adresses** → **inactive** : `RESEND_API_KEY` et `MAIL_FROM` ne sont pas renseignés. Aucun e-mail ne part ; il faut ouvrir l’administration pour découvrir les demandes.

Conséquences : la base est le **seul** point de collecte (un projet Supabase en pause ou saturé fait perdre la demande, le visiteur voyant « Envoi impossible ») ; l’accusé de réception au demandeur (EF-17) n’existe pas ; aucune réponse ne part de la plateforme — l’adresse du client est un simple lien `mailto:` et l’échange n’est pas tracé.

---

## 3. Prochaines étapes

### 3.1 Développement — avant la recette

1. **Activer l’e-mail** : compte Resend, vérification du domaine `epureau-ci.com` (DKIM/SPF — à coordonner avec la préservation des MX), puis `RESEND_API_KEY` et `MAIL_FROM` dans Vercel (Production et Preview). La valeur par défaut `onboarding@resend.dev` n’écrit qu’au titulaire du compte Resend : elle ne suffit pas.
2. **EF-17** — accusé de réception automatique au demandeur.
3. **EF-14** — pièce jointe, case de consentement, téléphone obligatoire, champ « secteur d’activité ».
4. **ET-18** — rédiger mentions légales et politique de confidentialité (les deux pages renvoient une 404 tant que les textes ne sont pas saisis dans Paramètres).
5. **ET-06** — retirer `unoptimized` de `next/image` et activer l’optimisation : cause directe du rendu flou.
6. **EF-02 / EF-03** — téléchargement de la présentation PDF et fenêtre vidéos en page d’accueil (dépend des fichiers client).
7. **ET-17** — limitation de débit sur `/api/cotation` (le champ piège seul est insuffisant).
8. Page **404** personnalisée et bandeau de contact en haut de page.
9. **ET-05** — mesurer PageSpeed mobile après l’optimisation des images (cible ≥ 85).
10. Optionnel, utile : **répondre au client depuis la fiche de demande**, réponse conservée dans l’historique.

### 3.2 À trancher avec EPUREAU

- **Fiches produits** : le CDC v2 a retiré le catalogue du périmètre (remarques du 26/07). Faire valider l’ajout, puis choisir la source des fiches réelles — liste fournie par EPUREAU, pré-remplissage à partir des gammes publiques des fabricants à valider ligne par ligne, ou saisie par l’équipe commerciale.
- **Autorisation écrite d’usage des marques NALCO et ECOLAB** — seul point susceptible de bloquer la mise en ligne, d’autant plus nécessaire avec des fiches par marque.
- **EF-09** : trois pages distinctes (Produits NALCO / Produits ECOLAB / Commodités & Réactifs) ou maintien des ancres dans `/negoce`.
- Blog (activation et rythme éditorial), version anglaise (lancement ou second temps), contrat de maintenance après garantie.

### 3.3 Attendu du client — en retard depuis le 15/09

Textes définitifs validés · **photos HD** des 5 réalisations (les fichiers actuels plafonnent à 640 px) · **3 vidéos** · **4 brochures PDF** · autorisation des marques · accès au compte registrar · informations FNE · arbitrages capital social et hébergement des vidéos.

### 3.4 Exploitation et mise en ligne

Compression des vidéos et vignettes (ET-07) · sauvegardes automatiques et restauration testée (ET-12 — le forfait Supabase gratuit n’en fournit pas : prévoir un export planifié) · bascule DNS en préservant les MX (ET-08/09) · guide d’utilisation en français et formation de 2 h (ET-21).

---

## 4. Rappels techniques

- Variables d’environnement : `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SUPER_EMAILS`, et à venir `RESEND_API_KEY` + `MAIL_FROM`.
- Les valeurs par défaut des liens LinkedIn, Facebook et Google Maps sont dans le code, mais **des paramètres déjà enregistrés en base les emportent** : les recoller une fois dans Paramètres si les champs y sont vides.
- La version en ligne ne reflète le travail qu’après `git push` et déploiement Vercel.
