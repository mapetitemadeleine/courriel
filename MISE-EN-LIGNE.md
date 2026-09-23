# L'accusé de réception de bonjour@mapetitemadeleine.org

Ce dossier contient le petit facteur : chaque lettre reçue à
**bonjour@mapetitemadeleine.org** arrive dans votre boîte, et son expéditeur
reçoit aussitôt un accusé de réception en français puis en anglais.

- `accuse-reception.html` — la lettre telle qu'elle sera reçue (aperçu).
- `src/reponse.js` — **le texte**. C'est le seul fichier à retoucher si vous
  changez les mots, la signature ou le sujet.
- `src/index.js` — le facteur (à ne pas toucher).
- `wrangler.toml` — la fiche du Worker.

---

## 1. Ouvrir un compte chez Resend (l'expéditeur)

Cloudflare sait recevoir, pas envoyer : Resend s'occupe de l'envoi. Gratuit
jusqu'à 3 000 lettres par mois — nous en enverrons quelques dizaines.

1. Allez sur **resend.com**, bouton **Sign up**, créez le compte avec votre
   adresse habituelle.
2. Dans le menu de gauche, **Domains**, puis **Add Domain**. Tapez
   `mapetitemadeleine.org` et validez.
3. Resend affiche trois ou quatre lignes à poser dans le DNS (des lignes
   `TXT` et `CNAME`). Gardez cette page ouverte.
4. Dans un autre onglet, ouvrez Cloudflare → domaine **mapetitemadeleine.org**
   → **DNS** → **Records** → bouton **Add record**. Recopiez chaque ligne de
   Resend : le **Type**, le **Name**, le **Content**. Pour les `CNAME`, mettez
   le nuage sur **DNS only** (gris, pas orange).
5. Retournez chez Resend et cliquez **Verify DNS Records**. Au bout de
   quelques minutes, le domaine passe à **Verified**.
6. Menu **API Keys** → **Create API Key** → nom « courriel », droits
   **Sending access**. Copiez la clef (elle commence par `re_`) et gardez-la
   de côté : Resend ne la remontrera plus.

## 2. Déposer le dossier sur GitHub

1. Sur **github.com**, bouton **+** en haut à droite → **New repository**.
   Nom : `courriel`. Propriétaire : **mapetitemadeleine**. Laissez **Private**
   si vous préférez. **Create repository**.
2. Sur la page du dépôt vide, cliquez **uploading an existing file**.
3. Glissez le dossier `courriel` de votre ordinateur — attention, il faut
   déposer **le contenu** : `src/`, `wrangler.toml`,
   `accuse-reception.html`, ce fichier. Puis **Commit changes**.

## 3. Créer le Worker

1. Cloudflare → **Compute** → **Workers & Pages** → **Create** →
   onglet **Import a repository** (ou **Connect to Git**).
2. Choisissez le dépôt **mapetitemadeleine/courriel**, branche `main`.
3. Laissez les réglages proposés (wrangler.toml fait le reste) et
   **Create and deploy**.

## 4. Poser les deux réglages

Workers & Pages → **courriel** → **Settings** → **Variables and Secrets** →
**Add** :

| Nom | Type | Valeur |
| --- | --- | --- |
| `BOITE` | Text | votre adresse personnelle, celle déjà vérifiée dans Email Routing |
| `RESEND_API_KEY` | Secret | la clef `re_…` copiée à l'étape 1 |

**Deploy** pour que les deux réglages prennent effet.

## 5. Brancher bonjour@ sur le facteur

Cloudflare → **Compute** → **Email Service** → **Email Routing** →
onglet **Routing Rules**.

- Si la règle `bonjour@mapetitemadeleine.org` existe déjà, cliquez-la,
  changez l'action **Send to an email** en **Send to a Worker**, et choisissez
  **courriel**. Enregistrez.
- Sinon, **Create address** : à gauche `bonjour`, action **Send to a Worker**,
  Worker **courriel**.

Le Worker fait suivre la lettre à `BOITE` lui-même : vous continuerez à tout
recevoir comme avant.

## 6. Essayer

Écrivez-vous à **bonjour@mapetitemadeleine.org** depuis une adresse qui n'est
pas celle de destination (votre téléphone, une amie). Vous devez recevoir la
lettre dans votre boîte, et l'expéditeur l'accusé de réception. Regardez les
indésirables la première fois.

---

## Facultatif — ne pas répondre deux fois le même jour

Sans cette étape, une personne qui écrit trois fois reçoit trois accusés.

1. Cloudflare → **Storage & Databases** → **KV** → **Create instance**, nom
   `souvenirs`. Copiez son **identifiant**.
2. Dans le dépôt GitHub, ouvrez `wrangler.toml` (crayon en haut à droite),
   retirez les dièses des trois dernières lignes et collez l'identifiant.
   **Commit changes** : le Worker se redéploie tout seul.

## Changer le texte de la réponse

Ouvrez `src/reponse.js` sur GitHub, crayon en haut à droite. Les mots sont en
haut du fichier (`SUJET`, `TEXTE`), et la lettre mise en forme juste en
dessous. **Commit changes** suffit : le Worker se redéploie.
