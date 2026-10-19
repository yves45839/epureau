# Référencement EPUREAU

## Configuration livrée

- Domaine de référence : https://epureau-ci.com.
- Versions canoniques explicites `/fr` et `/en`, avec alternates réciproques et version française par défaut. Les adresses sans préfixe restent des alias fonctionnels.
- Titres et descriptions des pages métiers adaptés à la Côte d’Ivoire, sans répétition artificielle de mots-clés.
- Métadonnées sociales Open Graph et Twitter, image de réalisation réelle.
- Données structurées LocalBusiness, WebSite, WebPage, BreadcrumbList et Service selon la page. Coordonnées issues des paramètres du site. Aucun avis, classement ou certification inventé.
- Sitemap bilingue des pages publiques, produits, réalisations, pages personnalisées et articles lorsque le blog est actif. Les brouillons sont exclus ; aucune date de modification artificielle.
- Pages d’aperçu non indexables.
- Questions-réponses visibles sur les métiers avec liens vers le contact et les réalisations.

## Maintenance

Les titres des pages métiers sont centralisés dans `src/content/seo.ts`. Les métadonnées des fiches produits, projets, articles et pages personnalisées suivent leurs contenus administrables. Les questions pratiques sont dans `src/components/ServiceQuestions.tsx`.

Publier des réalisations documentées : lieu, besoin initial, procédé, capacité, photographies et résultats mesurés uniquement lorsqu’ils sont disponibles et autorisés à la publication. Éviter les pages identiques créées pour multiplier les noms de villes.

Garder les coordonnées à jour dans les paramètres. La présence sur Google Business Profile, les liens de partenaires et la mesure des recherches via Search Console restent des actions externes facultatives ; elles ne sont pas activées par ce déploiement. Aucun abonnement ni envoi d’URL à un service tiers n’est nécessaire.

## Validation

Tests : `node --test scripts/seo.test.mjs`. Vérifier les balises canoniques et hreflang, le sitemap, les réponses 404 et les métadonnées après chaque changement de routage. Les résultats enrichis et les positions ne sont pas garantis.

Références :
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Découverte par les assistants IA

Le fichier robots.txt autorise explicitement OAI-SearchBot et PerplexityBot sur les pages publiques, avec les mêmes exclusions /admin et /api que la règle générale. Les autres moteurs restent couverts par la règle générale. Ces règles ne remplacent pas l’authentification.

Le fichier public /llms.txt est un résumé factuel avec liens vers les sources publiques. Ce format est complémentaire et expérimental : son utilisation par un assistant et son effet sur les recommandations ne sont pas garantis. Il faut l’actualiser si les domaines d’activité changent. Le HTML rendu côté serveur, le sitemap et les données structurées demeurent les principales sources.

Aucune autorisation supplémentaire d’entraînement, aucun compte payant et aucune inscription à un annuaire ne sont ajoutés. Les règles antérieures pour les autres robots restent inchangées. Un accès HTTP réussi avec le nom d’un robot ne prouve pas qu’une visite réelle depuis son réseau sera acceptée par tous les filtres de l’hébergeur.
