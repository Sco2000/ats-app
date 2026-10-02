# 📘 Documentation Exhaustive des Changements (01/10/2026 – 02/10/2026)

Ce document fournit la référence complète de toutes les modifications apportées à l'application **ATS Explore Mini-Program**. Chaque changement est documenté avec **l'état initial (Avant)**, **la modification apportée (Après)** et **la justification technique (Pourquoi)**.

---

## 📑 Sommaire
1. [Historique des Commits](#-1-historique-des-commits)
2. [Gestion des Réservations sans ID & `destinationId` Nul](#-2-gestion-des-réservations-sans-id--destinationid-nul)
3. [Architecture TabBar & Suppression de `/custom-tab-bar/`](#-3-architecture-tabbar--suppression-de-custom-tab-bar)
4. [Déduplication et Unification des Composants](#-4-déduplication-et-unification-des-composants)
5. [Éradication des Styles Inline (WXML vers WXSS)](#-5-éradication-des-styles-inline-wxml-vers-wxss)
6. [Conformité Stricte `@API-CONNECT` (Storage & Erreurs)](#-6-conformité-stricte-api-connect-storage--erreurs)
7. [Tableau Comparatif Détaillé Fichier par Fichier](#-7-tableau-comparatif-détaillé-fichier-par-fichier)

---

## ⏱️ 1. Historique des Commits

| Commit | Date & Heure | Type | Résumé de l'intervention |
| :--- | :--- | :--- | :--- |
| [`63b1cf4`](https://github.com/Sco2000/ats-app/commit/63b1cf4) | 01/10 14:28 | **fix / arch** | Migration des Skeletons vers UX, suppression polices 404, gestion flux réservations ATS |
| [`9e6ffd9`](https://github.com/Sco2000/ats-app/commit/9e6ffd9) | 02/10 11:53 | **fix / core** | Résolution des 8 points de revue (toast annulation, compteurs, déduplication, booking guard, `AppError`) |
| [`617d765`](https://github.com/Sco2000/ats-app/commit/617d765) | 02/10 12:03 | **refactor** | Migration de tous les styles inline WXML vers des classes WXSS dédiées |
| [`5a17f18`](https://github.com/Sco2000/ats-app/commit/5a17f18) | 02/10 12:13 | **fix / mappers** | Renforcement des mappers json-sculpt pour réservations (fallbacks & `targetData`) |
| [`ba4c8a8`](https://github.com/Sco2000/ats-app/commit/ba4c8a8) | 02/10 12:21 | **feat / skills** | Intégration de la skill complète WeChat / PMT (18 guides de référence dans `.agents/skills/`) |
| [`893bb19`](https://github.com/Sco2000/ats-app/commit/893bb19) | 02/10 12:24 | **fix / storage** | Élimination de `wx.*StorageSync` direct, routage 100% via `utils/storage.js` |
| [`a367cc9`](https://github.com/Sco2000/ats-app/commit/a367cc9) | 02/10 12:40 | **fix / import** | Correction du chemin d'accès relatif à `utils/storage.js` dans le composant image |
| [`67c0fc8`](https://github.com/Sco2000/ats-app/commit/67c0fc8) | 02/10 12:55 | **refactor** | Déduplication des handlers et calculs de cycle de vie (`destination-card` & `list-destination`) |
| [`2660922`](https://github.com/Sco2000/ats-app/commit/2660922) | 02/10 13:13 | **refactor / tabbar** | Suppression du dossier racine `/custom-tab-bar/`, intégration 100% dans `components/ui/` |
| [`0869090`](https://github.com/Sco2000/ats-app/commit/0869090) | 02/10 13:20 | **fix / fallback** | Résilience absolue pour les réservations sans ID ou sans bookingRef à tous les niveaux |

---

## 🛡️ 2. Gestion des Réservations sans ID & `destinationId` Nul

### Problème identifié
1. Certaines réservations de l'API ATS ne retournent pas de champ `id`, mais un `booking_ref` ou `reference`. D'autres retournent un schéma partiel sans identifiant unique.
2. Dans `pages/voyage/voyage.wxml`, la liste utilise `wx:key="id"`. Si l'élément n'a pas d'`id`, le moteur WeChat émet des avertissements et altère le recalcul d'affichage.
3. Lors du clic sur une carte sans `bookingRef`, l'événement transmettait `undefined`, rendant la carte non cliquable.
4. Dans `pages/booking/booking.js`, si `destinationId` arrivait nul ou manquant (ex: accès direct ou lien brisé), la page levait une exception `TypeError` en cherchant dans `app.globalData.DESTINATIONS`.

### Solutions appliquées
* **Dans les Mappers (`utils/mappers/reservation.sculpt.js`) :**
  ```javascript
  id: ['@link.id', '@link.booking_ref', '@link.bookingRef', '@link.reference'],
  bookingRef: ['@link.booking_ref', '@link.bookingRef', '@link.reference', '@link.id'],
  ```
* **Dans les Helpers (`utils/helpers/reservations.js`) :**
  Attribution systématique d'un fallback unique (`local_res_${index}_${Date.now()}` ou `remote_res_${index}_${Date.now()}`) garantissant qu'aucun objet de réservation n'ait un `id` vide.
* **Dans le Composant Carte (`components/ui/reservation-card/index.js`) :**
  ```javascript
  handleTap() {
    const res = this.properties.reservation || {};
    const ref = res.bookingRef || res.id || res.reference || res.booking_ref || '';
    this.triggerEvent('select', { bookingRef: ref, id: ref });
  }
  ```
* **Dans la Page Détail (`pages/reservation-detail/reservation-detail.js`) :**
  Interception universelle des options URL : `const rawRef = options.bookingRef || options.id || options.reference;`.
* **Dans le Tunnel de Réservation (`pages/booking/booking.js`) :**
  Guard clause dans `onLoad` : vérification stricte de `destinationId`, toast d'avertissement et redirection automatique vers l'accueil.

---

## 🧭 3. Architecture TabBar & Suppression de `/custom-tab-bar/`

### Problème identifié
Le dossier racine `/custom-tab-bar/` contenait des fichiers à la racine du projet, alors que la consigne d'organisation exige que tous les composants d'interface soient centralisés dans `components/ui/`.

### Solutions appliquées
1. **Suppression du dossier racine :** `custom-tab-bar/index.js`, `index.json`, `index.wxml` ont été supprimés.
2. **`app.json` :** Retrait de `"tabBar": { "custom": true, ... }` pour éviter que le compilateur WeChat ne cherche ce dossier manquant.
3. **Composant UI Direct :** Dans `components/ui/layout/index.wxml`, la barre d'onglets est rendue directement comme composant enfant :
   ```wxml
   <!-- Bottom Tab Bar -->
   <app-custom-tab-bar 
     wx:if="{{ showTabBar && activeTab }}" 
     activeTab="{{ activeTab }}" 
   />
   ```
4. **Navigation sans `wx.switchTab` :** Remplacement de tous les `wx.switchTab` par `wx.redirectTo` ou `wx.reLaunch` (dans `nav-bar`, `home.js`, `destination-detail.js`, `app.js` et `utils/helpers/navigation.js`).

---

## ⚡ 4. Déduplication et Unification des Composants

### [`components/ui/destination-card/`](components/ui/destination-card/)
* **Avant :** Présence de deux méthodes en doublon (`handleSubmit` et `emitCardPress`). Double calcul du style de padding (à la fois dans l'`observer` et dans `lifetimes.attached`).
* **Après :**
  - Suppression de `handleSubmit`.
  - Fusion dans une seule méthode protégée : `handleCardTap: withLock(function () { ... }, 500)`.
  - Sécurisation du clic favori : `handleLikeTap: withLock(function () { ... }, 300)`.
  - Centralisation du calcul de style dans `updateResolvedCardStyle()`.

### [`components/ui/list-destination/`](components/ui/list-destination/)
* **Avant :** Le calcul de la largeur des colonnes de grille (`computedGridItemWidth`) était dupliqué dans l'`observer` et dans `lifetimes.attached`.
* **Après :** Extraction du calcul dans la méthode unique `updateComputedGridItemWidth()`, suppression du doublon dans `attached`.

---

## 🎨 5. Éradication des Styles Inline (WXML vers WXSS)

* **`pages/booking/booking.wxml` & `.wxss` :** Les attributs `style="..."` sur `.traveler-copy` et `.traveler-controls` ont été supprimés et transférés dans `booking.wxss`.
* **`components/ui/destination-card/` :** Création de la classe `.destination-details-button` dans `index.wxss` et suppression de `buttonStyle` dans le WXML.
* **`pages/destination-detail/` :** Création de `.detail-booking-reserve-btn` dans `destination-detail.wxss` et suppression de `buttonStyle`.
* **`pages/favoris/favoris.wxml` :** Remplacement de `containerStyle="font-size: 28rpx; color: #7A8094;"` par les props natives `<app-typography size="14" weight="400" lineHeight="40rpx">`.

---

## 🔒 6. Conformité Stricte `@API-CONNECT` (Storage & Erreurs)

1. **Storage Sécurisé :** Remplacement de tous les appels directs `wx.getStorageSync`, `wx.setStorageSync`, `wx.removeStorageSync` par les méthodes sécurisées du wrapper `storage` (`utils/storage.js`).
2. **Hiérarchie d'Erreurs Typées :** Intégration de la hiérarchie d'erreurs `AppError` (`NetworkError`, `AuthorizationError`, `ValidationError`, `NotFoundError`, `ExternalServiceError`) dans `utils/apis/index.js` et `utils/helpers/error-handler.js`.
3. **Protection Anti-Clic Globale :** Remplacement des drapeaux manuels par le décorateur centralisé `withLock(fn, delay)` (`utils/helpers/interaction.js`).

---

## 📊 7. Tableau Comparatif Détaillé Fichier par Fichier

| Fichier | Ce qui était là (Avant) | Ce qui a été mis (Après) | Pourquoi on l'a changé |
| :--- | :--- | :--- | :--- |
| **`custom-tab-bar/*`** | Dossier d'entrée spécial WeChat à la racine du projet. | **Dossier supprimé.** | Déplacer 100% des composants dans `components/ui/`. |
| **`app.json`** | Bloc `"tabBar": { "custom": true, ... }`. | **Section supprimée.** | Éviter le crash `Component is not found in path custom-tab-bar/index`. |
| **`app.js`** | `wx.switchTab` en cas d'erreur 404. | `wx.reLaunch({ url: '/pages/home/home' })`. | Éviter l'erreur `fail can not switch to no-tabBar page`. |
| **`app.wxss`** | Déclarations `@font-face` pointant vers des `.ttf` locaux. | **Blocs supprimés.** | Élimination de l'erreur réseau 404 du compilateur WeChat. |
| **`components/ui/layout/index.json`** | Déclarait uniquement `app-nav-bar`. | Ajout de `"app-custom-tab-bar": "/components/ui/custom-tab-bar/index"`. | Permet à `app-layout` de monter la barre d'onglets UI. |
| **`components/ui/layout/index.wxml`** | Uniquement la navbar et le slot. | `<app-custom-tab-bar wx:if="{{ showTabBar && activeTab }}" ... />`. | Affichage direct et autonome de la barre d'onglets. |
| **`components/ui/tab-bar/index.js`** | `navigationType: 'switchTab'`. | `navigationType: 'redirectTo'`. | Navigation directe sans dépendre de la configuration native `tabBar`. |
| **`components/ui/nav-bar/index.js`** | `wx.switchTab` lors des retours arrière. | `wx.redirectTo`. | Cohérence de navigation avec l'architecture sans tabbar natif. |
| **`components/ui/image/index.js`** | Import erroné `../../utils/storage.js`. | Import exact `../../../utils/storage.js`. | Résolution du crash `module components/utils/storage.js is not defined`. |
| **`components/ux/*-skeleton/`** | Situés dans `components/ui/`. | **Déplacés dans `components/ux/`.** | Respect de la séparation architecture UI vs UX. |
| **`components/ui/destination-card/index.js`** | Doublons de fonctions et calculs doubles. | `handleCardTap: withLock(...)`, suppression de `handleSubmit`. | Déduplication de code, performance et anti-double-clic. |
| **`components/ui/destination-card/index.wxml`** | `buttonStyle` en dur dans le WXML. | Classe WXSS `.destination-details-button`. | Interdiction des styles inline. |
| **`components/ui/list-destination/index.js`** | Calcul de largeur de grille dupliqué. | Méthode unique `updateComputedGridItemWidth()`. | Élimination de redondance et de `setData` superflus. |
| **`components/ui/reservation-card/index.js`** | Émettait seulement `reservation.bookingRef`. | Émet `res.bookingRef \|\| res.id \|\| res.reference`. | Clic fonctionnel même si la réservation n'a qu'un `id`. |
| **`pages/booking/booking.js`** | Pas de contrôle si `destinationId` est nul. | Guard clause avec alerte et redirection polie. | Évite les plantages sur destinations invalides. |
| **`pages/booking/booking.wxml`** | Styles inline sur `.traveler-copy` et controls. | Styles migrés dans `booking.wxss`. | Nettoyage des styles inline. |
| **`pages/destination-detail/destination-detail.js`** | `wx.switchTab` pour le retour accueil. | `wx.redirectTo`. | Compatibilité navigation sans tabbar natif. |
| **`pages/destination-detail/destination-detail.wxml`** | `buttonStyle` inline sur le bouton de réservation. | Classe WXSS `.detail-booking-reserve-btn`. | Respect de la règle de style WXSS. |
| **`pages/reservation-detail/reservation-detail.js`** | Pas de toast à l'annulation, options `bookingRef` strictes. | Toast d'attente immédiat, statut mis à jour, support `id` / `bookingRef`. | Confort utilisateur ATS et tolérance sur les paramètres URL. |
| **`pages/voyage/voyage.js`** | Compteur non synchronisé, ouverture stricte `bookingRef`. | Synchronisation cache en direct, support `detail.bookingRef \|\| detail.id`. | Fiabilité du compteur de voyages et ouverture garantie. |
| **`pages/favoris/favoris.wxml`** | `containerStyle` avec police en dur. | Props natives de typographie `size`, `weight`, `lineHeight`. | Exploitation correcte du design system. |
| **`pages/home/home.js`** | `wx.switchTab` sur le bouton "Voir tout". | `wx.redirectTo`. | Navigation fluide vers Explorer. |
| **`utils/helpers/interaction.js`** | Non existant (drapeaux anti-spam manuels). | **Création du helper `withLock(fn, delay)`.** | Protection centralisée et fiable contre les clics rapides. |
| **`utils/helpers/error-handler.js`** | Non existant (`console.error` disparates). | **Création de `handleAppError(error, context)`.** | Notification EventBus et toasts d'erreur unifiés. |
| **`utils/helpers/reservations.js`** | Mapping partiel sans fallback d'ID. | Fallback unique `ref` garanti sur chaque carte. | Clé de liste `wx:key="id"` toujours valide. |
| **`utils/storage/reservations.js`** | Recherche stricte par `bookingRef`. | Recherche et sauvegarde tolérantes par `bookingRef` ou `id`. | Pas de perte de données locales si `id` est utilisé. |
| **`utils/mappers/reservation.sculpt.js`** | Schéma strict sans repli. | `id` et `bookingRef` résolvent toutes les variantes de clés. | Résilience absolue face aux payloads asymétriques ATS. |
| **`utils/helpers/favorites.js`** | Appels directs `wx.getStorageSync`. | Remplacement par le wrapper `storage.get` / `storage.set`. | Règle d'or `@API-CONNECT`. |
| **`utils/apis/auth.js`** | `wx.setStorageSync` et `new Error()`. | `storage.set()` et erreurs typées `AuthorizationError`. | Sécurité du stockage et typage d'erreurs. |
| **`utils/apis/http.js`** | `new URLSearchParams()`. | Sérialiseur sûr `formatQuery(query)`. | Compatibilité tous terminaux mobiles. |
| **`utils/apis/index.js`** | Erreurs génériques `new Error()`. | Factory `createTypedError()` et méthode `getBookings()`. | Gestion d'erreur typée et récupération des réservations. |
