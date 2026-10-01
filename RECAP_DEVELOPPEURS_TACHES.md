# 🚀 Guide Détaillé des Tâches — ATS Explore (Équipe de 7 Développeurs)

> **Objectif :** Corriger l'ensemble des points du récapitulatif technique et des demandes ATS (G1, G3, G4) avec **zéro conflit Git**.  
> **Règle d'or :** Chaque développeur a son propre périmètre de fichiers strictement exclusif. Aucun développeur ne touche aux fichiers d'un autre.

---

## 🗺️ Matrice d'Isolation des 7 Développeurs

| Développeur | Domaine d'intervention | Fichiers autorisés (Exclusifs) | Branche Git |
| :--- | :--- | :--- | :--- |
| **DÉV 1** | **Architecture UX & Skeletons** | `components/ux/*-skeleton/**`<br>`app.wxss` (suppression polices 404) | `feature/dev1-ux-skeletons` |
| **DÉV 2** | **Composants Listes & Cartes (G3)** | `components/ui/list-destination/**`<br>`components/ui/destination-card/**` | `feature/dev2-list-destination-card` |
| **DÉV 3** | **Tunnel Réservation (Date & Voyageurs)** | `pages/booking/**` | `feature/dev3-booking-clean-and-guard` |
| **DÉV 4** | **Détail & Annulation Réservation** | `pages/reservation-detail/**` | `feature/dev4-reservation-cancellation` |
| **DÉV 5** | **Page Mes Voyages & Listing (G4)** | `pages/voyage/**` | `feature/dev5-voyage-listing-counters` |
| **DÉV 6** | **Favoris & Navigation Retour (G1)** | `pages/favoris/**`<br>`pages/destination-detail/destination-detail.js` | `feature/dev6-favoris-and-navigation` |
| **DÉV 7** | **Architecture Core (Mappers, Erreurs, Anti-Clic)** | `utils/helpers/interaction.js`<br>`utils/helpers/error-handler.js`<br>`utils/mappers/reservation.sculpt.js`<br>`utils/helpers/reservations.js` | `feature/dev7-core-mappers-and-helpers` |

---

# 👨‍💻 DÉVELOPPEUR 1 : Skeletons UX & Polices 404

### 🎯 Objectifs
1. **Déplacer** tous les skeletons de chargement depuis `components/ui/` vers `components/ux/` selon les règles d'architecture du projet (`components/ux/README.fr.md`).
2. **Éliminer** l'erreur réseau 404 dans la console provoquée par les chemins locaux de polices (`Inter_*.ttf-do-not-use-local-path-`).

### 📁 Fichiers Assignés
- `components/ui/destination-card-skeleton/` *(à déplacer)*
- `components/ui/reservation-card-skeleton/` *(à déplacer)*
- `components/ui/reservation-detail-skeleton/` *(à déplacer)*
- `app.wxss`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Déplacement des dossiers Skeletons
Déplacez les trois répertoires suivants dans `components/ux/` :
- `components/ui/destination-card-skeleton` ➔ `components/ux/destination-card-skeleton`
- `components/ui/reservation-card-skeleton` ➔ `components/ux/reservation-card-skeleton`
- `components/ui/reservation-detail-skeleton` ➔ `components/ux/reservation-detail-skeleton`

#### Étape 2 : Nettoyage des `@font-face` dans `app.wxss`
* **Localisation :** [`app.wxss`](file:///c:/Orange/Projet/ats/ats-app/app.wxss), lignes 54 à 84.
* **Problème :** Le compilateur TCMPP / WeChat bloque les `@font-face` locaux avec `-do-not-use-local-path-` (404 Not Found).
* **Action :** Supprimer ou commenter les 4 blocs `@font-face` locaux :

```css
/* ==========================================================================
   AVANT (Lignes 54-84 de app.wxss) — PROVOQUE L'ERREUR 404 :
   ========================================================================== */
@font-face {
  font-family: 'Inter';
  src: url('./assets/app-fonts/Inter_18pt-Regular.ttf');
  font-weight: 400;
  ...
}

/* ==========================================================================
   APRÈS (Conserver uniquement la règle font-family système à la ligne 87) :
   ========================================================================== */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  ...
}
```

### 🧪 Validation
1. Lancer la compilation dans TCMPP DevTools (**Ctrl + B**).
2. Ouvrir la console : vérifier qu'**aucune erreur 404** sur `Inter_18pt-*.ttf` n'apparaît.
3. Vérifier que le dossier `components/ui/` ne contient plus de skeletons et que `components/ux/` contient les 3 dossiers.

### 💻 Commandes Git
```bash
git checkout -b feature/dev1-ux-skeletons
git add components/ux/ components/ui/ app.wxss
git commit -m "refactor(ux): move skeletons to components/ux and use system fonts in app.wxss"
git push -u origin feature/dev1-ux-skeletons
```

---

# 👨‍💻 DÉVELOPPEUR 2 : Composants `list-destination` & Cartes (G3)

### 🎯 Objectifs
1. **Supprimer la redondance WXML** dans `components/ui/list-destination/index.wxml`.
2. **Demande ATS G3** : afficher les étoiles selon la note du package (`destination.rating`) et garantir que l'image de la destination ne soit jamais déformée (`mode="aspectFill"`).

### 📁 Fichiers Assignés
- `components/ui/list-destination/index.wxml`
- `components/ui/list-destination/index.json`
- `components/ui/destination-card/index.wxml`
- `components/ui/destination-card/index.wxss`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Mettre à jour l'import du skeleton dans `list-destination/index.json`
Pointez vers le nouveau chemin sous `components/ux/` :
```json
{
  "component": true,
  "usingComponents": {
    "app-destination-card": "../destination-card/index",
    "app-destination-card-skeleton": "/components/ux/destination-card-skeleton/index"
  }
}
```

#### Étape 2 : Nettoyer la redondance WXML dans `list-destination/index.wxml`
* **Problème :** Les attributs `cardWidth`, `imageHeight`, `cardStyle`, etc. sont répétés 6 fois.
* **Correction :** Factoriser en utilisant un bloc commun pour le rendu.

#### Étape 3 : Afficher les étoiles et sécuriser l'image dans `destination-card/index.wxml`
* **Localisation :** [`components/ui/destination-card/index.wxml`](file:///c:/Orange/Projet/ats/ats-app/components/ui/destination-card/index.wxml), après la ligne 34.
* **Ajout pour la demande ATS G3 :**
```xml
<!-- AJOUT G3 : Affichage de la note et des étoiles sous le titre/localisation -->
<view class="destination-card__rating-row" wx:if="{{ destination.rating }}">
  <text class="destination-card__star">★</text>
  <text class="destination-card__score">{{ destination.rating }}</text>
  <text class="destination-card__reviews" wx:if="{{ destination.reviewCount }}">({{ destination.reviewCount }})</text>
</view>
```
Dans `destination-card/index.wxss`, ajouter les styles :
```css
.destination-card__rating-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
  margin-bottom: 6rpx;
}
.destination-card__star {
  color: #F59E0B;
  font-size: 26rpx;
}
.destination-card__score {
  font-size: 24rpx;
  font-weight: 600;
  color: #1C1C1C;
}
.destination-card__reviews {
  font-size: 22rpx;
  color: #667085;
}
```

### 🧪 Validation
1. Ouvrir l'accueil et l'explorateur : vérifier que les cartes affichent la note en étoiles et les avis sans déformation d'image.
2. Basculer entre le mode scroll et le mode grid : aucun décalage d'affichage.

### 💻 Commandes Git
```bash
git checkout -b feature/dev2-list-destination-card
git add components/ui/list-destination/ components/ui/destination-card/
git commit -m "feat(cards): factorize list-destination and add rating stars with aspectFill"
git push -u origin feature/dev2-list-destination-card
```

---

# 👨‍💻 DÉVELOPPEUR 3 : Tunnel Réservation (`pages/booking/`)

### 🎯 Objectifs
1. **Supprimer les énormes styles CSS inline** définis en JavaScript (`DISABLED_BUTTON_STYLE`, etc.) et les transférer dans `booking.wxss`.
2. **Sécuriser `destinationId`** dans `onLoad` : si l'ID est absent, nul ou introuvable, afficher une alerte et retourner en arrière.

### 📁 Fichiers Assignés
- `pages/booking/booking.js`
- `pages/booking/booking.wxss`
- `pages/booking/booking.wxml`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Nettoyer `pages/booking/booking.js`
* **Lignes 3 à 6 :** Supprimer complètement :
  ```javascript
  // ❌ SUPPRIMER CES LIGNES :
  const DISABLED_BUTTON_STYLE = '...';
  const ACTIVE_BUTTON_STYLE = '...';
  const TRAVELER_CARD_STYLE = '...';
  const PRICE_CARD_STYLE = '...';
  ```
* **Dans `data` :** Supprimer `continueButtonStyle`, `travelerCardStyle`, `priceCardStyle`. Conserver uniquement le booléen `canContinue: false`.
* **Dans `selectDate` :** Ne plus mettre à jour `continueButtonStyle`, mettre seulement `canContinue: true`.
* **Dans `onLoad` (Clause de garde `destinationId`) :**
```javascript
  onLoad(options = {}) {
    const rawId = options.destinationId;
    const destinationId = rawId ? Number(rawId) : null;

    // 1. Contrôle : destinationId doit être un nombre valide
    if (!destinationId || Number.isNaN(destinationId)) {
      wx.showToast({
        title: 'Destination invalide',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];
    const destination = destinations.find((item) => Number(item.id) === destinationId);

    // 2. Contrôle : la destination doit exister dans les données
    if (!destination) {
      wx.showToast({
        title: 'Destination non trouvée',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    const basePrice = parsePrice(destination.price);
    this.setData({ destination, basePrice }, () => this.updatePrice());
  },
```

#### Étape 2 : Ajouter les classes dans `pages/booking/booking.wxss`
```css
.btn-continue {
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 40rpx;
}
.btn-continue--disabled {
  background: #95CFA5;
  box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.12);
}
.btn-continue--active {
  background: #16A34A;
  box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.18);
}
```

#### Étape 3 : Adapter `pages/booking/booking.wxml`
Remplacer le bouton en fin de fichier :
```xml
<!-- Remplacer style="{{ continueButtonStyle }}" par les classes dynamiques : -->
<view class="btn-continue {{ canContinue ? 'btn-continue--active' : 'btn-continue--disabled' }}" bindtap="handleContinue">
  Continuer
</view>
```

### 🧪 Validation
1. Naviguer vers `pages/booking/booking` sans paramètre : vérifier que le toast *"Destination invalide"* apparaît et que l'écran retourne automatiquement en arrière.
2. Naviguer vers une réservation depuis une destination : vérifier que le bouton "Continuer" passe bien du vert clair désactivé au vert foncé actif dès qu'une date est choisie.

### 💻 Commandes Git
```bash
git checkout -b feature/dev3-booking-clean-and-guard
git add pages/booking/
git commit -m "fix(booking): remove inline styles, add BEM classes and guard destinationId"
git push -u origin feature/dev3-booking-clean-and-guard
```

---

# 👨‍💻 DÉVELOPPEUR 4 : Annulation & Détail Réservation

### 🎯 Objectifs
1. **Implémenter `cancelReservation()`** dans [`pages/reservation-detail/reservation-detail.js`](file:///c:/Orange/Projet/ats/ats-app/pages/reservation-detail/reservation-detail.js) avec une boîte de dialogue de confirmation et un Toast informatif ("Demande transmise au partenaire").
2. **Sécuriser la page de détail** en cas d'erreur réseau avec un état de repli propre.

### 📁 Fichiers Assignés
- `pages/reservation-detail/reservation-detail.js`
- `pages/reservation-detail/reservation-detail.wxml`
- `pages/reservation-detail/reservation-detail.wxss`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Implémenter l'annulation dans `reservation-detail.js`
* **Localisation :** Ligne 41 de `pages/reservation-detail/reservation-detail.js`.
* **Remplacer `cancelReservation() {}` par :**
```javascript
  cancelReservation() {
    const { reservation } = this.data;
    if (!reservation) return;

    wx.showModal({
      title: 'Demande d\'annulation',
      content: 'Souhaitez-vous demander l\'annulation de cette réservation auprès du partenaire ATS ?',
      confirmText: 'Confirmer',
      cancelText: 'Retour',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          // Affichage du toast informatif en attendant les retours de l'équipe partenaire ATS
          wx.showToast({
            title: 'Demande d\'annulation prise en compte. Un conseiller vous contactera.',
            icon: 'none',
            duration: 3000,
          });

          // Mise à jour visuelle immédiate de l'état
          this.setData({
            'reservation.statusLabel': 'Annulation demandée',
            'reservation.statusClass': 'pending',
            'reservation.isUpcoming': false,
          });
        }
      },
    });
  },
```

### 🧪 Validation
1. Aller sur un détail de réservation et cliquer sur "Annuler".
2. Vérifier que la modale s'affiche, puis après confirmation, que le toast apparaît et que le statut passe à "Annulation demandée".

### 💻 Commandes Git
```bash
git checkout -b feature/dev4-reservation-cancellation
git add pages/reservation-detail/
git commit -m "feat(reservation-detail): implement cancellation confirmation modal with partner toast"
git push -u origin feature/dev4-reservation-cancellation
```

---

# 👨‍💻 DÉVELOPPEUR 5 : Page Mes Voyages & Listing (G4)

### 🎯 Objectifs
1. **Éliminer l'affichage prématuré** de *"0 réservation"* avant la fin du chargement.
2. **Demande ATS G4** : Dynamiser le listing des réservations avec décompte exact et gestion singulier/pluriel.

### 📁 Fichiers Assignés
- `pages/voyage/voyage.js`
- `pages/voyage/voyage.wxml`
- `pages/voyage/voyage.wxss`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Corriger `pages/voyage/voyage.js`
* **Localisation :** Lignes 11 et 23 de `pages/voyage/voyage.js`.
* **Remplacer par :**
```javascript
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    loading: true,
    resultsLabel: '', // ➔ Ne pas initialiser avec '0 réservation' !
  },

  refreshReservations() {
    this.setData({ loading: true });

    const reservations = getLocalReservationCards();
    const total = reservations.length;

    // Gestion du libellé exact
    let resultsLabel = '';
    if (total === 1) {
      resultsLabel = '1 réservation';
    } else if (total > 1) {
      resultsLabel = `${total} réservations`;
    }

    this.setData({
      reservations,
      loading: false,
      resultsLabel,
    });
  },
```

#### Étape 2 : Masquer le header pendant le chargement dans `voyage.wxml`
```xml
<!-- Ne pas afficher de texte d'en-tête pendant le chargement ni si la liste est vide -->
<view class="voyages-page__header" wx:if="{{ !loading && reservations.length > 0 }}">
  <app-typography size="14" weight="400" color="#7A8094">
    {{ resultsLabel }}
  </app-typography>
</view>
```

### 🧪 Validation
1. Ouvrir l'onglet "Voyages" : pendant l'affichage des skeletons, aucun texte "0 réservation" ne doit clignoter en haut.
2. Dès la fin du chargement : si aucune réservation, l'écran vide s'affiche proprement ; si des réservations existent, le bon nombre s'affiche au singulier ou au pluriel.

### 💻 Commandes Git
```bash
git checkout -b feature/dev5-voyage-listing-counters
git add pages/voyage/
git commit -m "fix(voyage): eliminate flash of zero count and format plural labels"
git push -u origin feature/dev5-voyage-listing-counters
```

---

# 👨‍💻 DÉVELOPPEUR 6 : Favoris & Navigation Retour (G1)

### 🎯 Objectifs
1. **Demande ATS G1** : Corriger la redirection du bouton "Retour" (doit retourner d'exactement une page en arrière sans bloquer).
2. **Corriger le décompte des favoris** pour se baser directement sur les données persistées et supprimer le texte "Chargement des favoris…" intempestif.

### 📁 Fichiers Assignés
- `pages/favoris/favoris.js`
- `pages/favoris/favoris.wxml`
- `pages/destination-detail/destination-detail.js`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Sécuriser la navigation retour dans `destination-detail.js` (G1)
* **Localisation :** Lignes 73-93 de [`pages/destination-detail/destination-detail.js`](file:///c:/Orange/Projet/ats/ats-app/pages/destination-detail/destination-detail.js).
* **Remplacer `handleBack` par :**
```javascript
  handleBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    // Si la page a été ouverte directement (aucun historique), rediriger vers l'accueil
    wx.switchTab({
      url: '/pages/home/home',
    });
  },
```

#### Étape 2 : Corriger le libellé des favoris dans `favoris.js` & `favoris.wxml`
* **Dans `favoris.js` :**
```javascript
function formatFavoritesLabel(count) {
  if (count === 0) return '';
  return `${count} destination${count > 1 ? 's' : ''} sauvegardée${count > 1 ? 's' : ''}`;
}

// Dans data :
resultsLabel: '',
loading: true,
```
* **Dans `favoris.wxml` :**
```xml
<view class="favorites-page__header" wx:if="{{ !loading && favoriteDestinations.length > 0 }}">
  <app-typography size="14" weight="500" color="#7A8094">
    {{ resultsLabel }}
  </app-typography>
</view>
```

### 🧪 Validation
1. Naviguer vers le détail d'une destination depuis l'accueil ou les favoris, puis appuyer sur "Retour" : la page précédente se rouvre immédiatement sans délai ni blocage.
2. Ouvrir "Favoris" : le compteur n'apparaît que quand les données sont prêtes et affiche le nombre exact d'éléments aimés.

### 💻 Commandes Git
```bash
git checkout -b feature/dev6-favoris-and-navigation
git add pages/favoris/ pages/destination-detail/destination-detail.js
git commit -m "fix(favoris-nav): fix back navigation delta and dynamic favorites count"
git push -u origin feature/dev6-favoris-and-navigation
```

---

# 👨‍💻 DÉVELOPPEUR 7 : Architecture Core (Mappers, Erreurs & Anti-Clic)

### 🎯 Objectifs
1. **Créer le helper central anti-clic répété (`withLock`)** pour supprimer tous les `setTimeout` et variables manuelles dispersées.
2. **Mettre à jour le mapper de réservation** (`ReservationDetailSchema`) selon la v2.6.0 de la collection Postman.
3. **Créer le helper centralisé de gestion d'erreurs (`handleAppError`)** relié aux classes d'erreurs existantes (`utils/errors/`).

### 📁 Fichiers Assignés
- `utils/helpers/interaction.js` *(nouveau)*
- `utils/helpers/error-handler.js` *(nouveau)*
- `utils/mappers/reservation.sculpt.js`
- `utils/helpers/reservations.js`

---

### 📝 Modifications pas-à-pas

#### Étape 1 : Créer `utils/helpers/interaction.js`
```javascript
// utils/helpers/interaction.js
/**
 * Empêche les clics répétés (anti-rebond / throttling) sur une fonction d'action.
 * @param {Function} fn - La fonction à exécuter
 * @param {number} [delay=500] - Délai de verrouillage en ms
 * @returns {Function}
 */
export function withLock(fn, delay = 500) {
  let isLocked = false;
  return function (...args) {
    if (isLocked) return;
    isLocked = true;
    setTimeout(() => {
      isLocked = false;
    }, delay);
    return fn.apply(this, args);
  };
}
```

#### Étape 2 : Mettre à jour `utils/mappers/reservation.sculpt.js` (API v2.6.0)
* **Localisation :** [`utils/mappers/reservation.sculpt.js`](file:///c:/Orange/Projet/ats/ats-app/utils/mappers/reservation.sculpt.js).
* **Remplacer par les champs complets de l'API v2.6.0 :**
```javascript
export const ReservationSchema = {
  bookingRef: '@link.booking_ref',
  status: '@link.status',
  total: '@link.total',
  currency: '@link.currency',
  note: '@link.note',
};

export const ReservationDetailSchema = {
  bookingRef: '@link.booking_ref',
  status: '@link.status',
  date: '@link.date',
  travelers: '@link.travelers',
  packageTitle: '@link.package',
  image: '@link.image',
  location: '@link.location',
  categories: '@link.categories',
  total: '@link.total',
  currency: '@link.currency',
  transactionId: '@link.transaction_id',
  note: '@link.note',
};
```

#### Étape 3 : Créer `utils/helpers/error-handler.js`
```javascript
// utils/helpers/error-handler.js
import { NetworkError, ValidationError, AuthorizationError } from '../errors/index.js';

/**
 * Affiche un toast d'erreur clair et contextualisé à l'utilisateur.
 * @param {Error} error
 * @param {string} [defaultMessage='Une erreur est survenue']
 */
export function handleAppError(error, defaultMessage = 'Une erreur est survenue') {
  console.error('[AppError]', error);

  let userMessage = defaultMessage;
  if (error instanceof NetworkError) {
    userMessage = 'Connexion réseau instable. Vérifiez votre connexion.';
  } else if (error instanceof AuthorizationError) {
    userMessage = 'Session expirée. Reconnexion en cours...';
  } else if (error?.message) {
    userMessage = error.message;
  }

  wx.showToast({
    title: userMessage,
    icon: 'none',
    duration: 2500,
  });
}
```

### 🧪 Validation
1. Lancer les tests unitaires ou vérifier que l'importation de `withLock` et `handleAppError` fonctionne sans erreur de syntaxe.
2. Vérifier que `ReservationDetailSchema` extrait bien les champs `image`, `location`, `categories` et `transactionId` depuis une réponse API.

### 💻 Commandes Git
```bash
git checkout -b feature/dev7-core-mappers-and-helpers
git add utils/helpers/interaction.js utils/helpers/error-handler.js utils/mappers/reservation.sculpt.js utils/helpers/reservations.js
git commit -m "feat(core): add withLock helper, handleAppError and update reservation mapper v2.6.0"
git push -u origin feature/dev7-core-mappers-and-helpers
```

---

## 🚦 Protocole de Merge Git (Zéro Conflit)

1. **Étape 1 :** **DÉV 1** termine sa branche (`feature/dev1-ux-skeletons`), ouvre sa Pull Request, et **on la merge en premier**.
2. **Étape 2 :** Les développeurs 2 à 7 font un `git pull origin develop`.
3. **Étape 3 :** Les développeurs 2, 3, 4, 5, 6 et 7 développent **en parallèle sans aucun risque de collision**, car aucun fichier n'est partagé entre leurs branches.
4. **Étape 4 :** Chaque développeur teste sa feature sur le simulateur TCMPP avant de soumettre sa PR.
