# E-mails clients EPUREAU

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
