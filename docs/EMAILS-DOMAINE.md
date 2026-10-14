# E-mails clients EPUREAU

## Contrôle du 14 octobre 2026

Vérification en lecture seule avec `node scripts/check-domain-mail.cjs`. Aucun DNS modifié et aucun e-mail envoyé.

| Point contrôlé | Résultat observé |
| --- | --- |
| Serveurs DNS | `dns11.ovh.net` et `ns11.ovh.net` |
| Domaine principal | A `216.198.79.1`, HTTPS 200, serveur Vercel |
| `www.epureau-ci.com` | Nom non résolu ; A et CNAME introuvables |
| Réception des e-mails | MX priorité 0 : `epureauci-com01i.mail.protection.outlook.com` |
| SPF racine | Un seul TXT SPF : `v=spf1 include:spf.protection.outlook.com -all` |
| DKIM Microsoft 365 | CNAME `selector1._domainkey` et `selector2._domainkey` introuvables |
| DMARC | TXT `_dmarc` introuvable |
| Envoi Resend | TXT `resend._domainkey`, TXT et MX `send` introuvables |
| Configuration locale du site | `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO` absentes |

Le routage Microsoft 365 est présent, mais cette vérification ne prouve ni l’existence de chaque boîte, ni la livraison effective. Les sélecteurs DKIM vérifiés sont les noms standards Microsoft 365 et Resend ; aucun compte fournisseur n’a été inspecté. Les variables de production Vercel n’ont pas été consultées : l’absence locale ne permet pas de conclure sur leur présence en production.

Actions à effectuer avec les accès OVH, Vercel, Microsoft 365 et Resend :

1. Ajouter `www.epureau-ci.com` au projet Vercel, recopier chez OVH la cible DNS exacte affichée par Vercel, puis configurer sa redirection vers `https://epureau-ci.com`. Ne pas changer l’enregistrement A principal qui répond déjà. Les métadonnées, le sitemap et les liens de société du code utilisent désormais le domaine principal fonctionnel.
2. Consulter Microsoft 365 pour obtenir les deux cibles DKIM propres au compte, les ajouter sans modifier les MX existants, puis activer et vérifier la signature.
3. Configurer le domaine d’envoi dans Resend en suivant les valeurs générées par le fournisseur. Ne pas remplacer le SPF Microsoft 365 à la racine ni créer un second SPF au même nom.
4. Vérifier les trois variables d’envoi dans Vercel. Le champ `MAIL_REPLY_TO` doit correspondre à une boîte réellement surveillée.
5. Définir une politique DMARC après inventaire des expéditeurs légitimes et validation de leur alignement. Ne pas activer un rejet strict sans ce contrôle.
6. Faire un envoi de test autorisé, puis contrôler les en-têtes SPF/DKIM/DMARC et la réception. Aucun test d’envoi n’a été réalisé pendant cet audit.

Références : [configuration des domaines Vercel](https://vercel.com/docs/domains/working-with-domains/add-a-domain), [DKIM Microsoft 365](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure), [domaines vérifiés Resend](https://resend.com/docs/dashboard/domains/introduction).

## Activation

Le site utilise Resend pour les notifications et les réponses. Les boîtes de messagerie existantes restent chez leur fournisseur actuel.

Dans Vercel, environnement Production, renseigner :

- `RESEND_API_KEY` : clé d’envoi Resend, à enregistrer comme secret.
- `MAIL_FROM` : `EPUREAU Côte d’Ivoire <adresse@votre-domaine>` avec le domaine vérifié dans Resend.
- `MAIL_REPLY_TO` : boîte EPUREAU existante qui reçoit les réponses des clients.

Redéployer après modification des variables. Dans Administration → Paramètres, renseigner les « Adresses de notification », séparées par des virgules, puis publier. Toutes ces adresses reçoivent les demandes et réclamations du site. Le bouton Répondre de ces notifications répond directement au client.

## DNS chez le gestionnaire du domaine

Ajouter le domaine dans Resend → Domains, activer l’envoi, puis recopier exactement les enregistrements affichés :

| Type | Nom habituel | Valeur |
| --- | --- | --- |
| TXT, DKIM | `resend._domainkey` | Clé publique générée par Resend |
| TXT, SPF | `send` (sous-domaine de retour) | Valeur affichée par Resend |
| MX, retour d’envoi | `send` | Serveur régional et priorité affichés par Resend |
| TXT, DMARC | `_dmarc` | Conserver la politique existante ; si absente, commencer par `v=DMARC1; p=none;` |

Les noms sont relatifs au domaine ajouté dans Resend et peuvent varier. Ne pas remplacer les MX à la racine du domaine : ils assurent la réception des boîtes existantes. Ne pas créer un second SPF au même nom. Ne pas affaiblir une politique DMARC existante. Aucun enregistrement web A/CNAME n’est nécessaire pour cette fonction e-mail.

Sources : https://resend.com/docs/dashboard/domains/introduction et https://resend.com/docs/dashboard/domains/managing-domains

## Utilisation

Administration → Demandes & réclamations → Répondre par e-mail. Rédiger, vérifier l’aperçu puis envoyer. La signature correspond au nom du compte connecté. Administrateurs et commerciaux peuvent répondre ; les éditeurs de contenu ne le peuvent pas.

L’historique distingue un envoi accepté par le prestataire d’un envoi non confirmé. « Accepté » ne garantit pas la réception en boîte principale. En cas d’erreur, réessayer le même envoi ; la clé anti-doublon est conservée. Après 23 heures, vérifier le journal du fournisseur avant toute nouvelle tentative.

Les réponses entrantes des clients sont reçues dans `MAIL_REPLY_TO` ; elles ne sont pas synchronisées dans l’administration. Cette fonctionnalité traite les demandes du site, pas l’ensemble des e-mails reçus par vos boîtes.

Resend propose une formule gratuite avec quotas ; vérifier les limites actuelles sur https://resend.com/pricing avant activation. Aucun forfait payant n’est activé par le code.
