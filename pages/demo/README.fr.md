# Page de démonstration

**Route :** `pages/demo/index`

Une vitrine complète de composants montrant tous les principaux modèles du boilerplate.

## Ce que cela démontre

### Composant Stepper
- Indicateur multi-étapes avec navigation précédent/suivant
- Gestion de l'événement `bind:change`
- Affichage dynamique des étapes

### États des boutons
- État de chargement avec spinner (`isSubmitting`)
- État désactivé
- Déclencheur de bottom sheet

### EventBus (pattern helper)
- `createPageHelpers()` pour synchronisation automatique de l'état
- Cycle de vie `subscribe()` / `loadInitial()` / `unsubscribe()`
- Affiche le nom de l'utilisateur depuis l'état partagé

### Filtres WXS
- Import `<wxs>` en haut du WXML
- Affichage en direct de `formatDate`, `formatPrice`, `truncate`, `statusClass`, `capitalize`, `timeAgo`
- Données d'exemple passées depuis `data`

### Comportement de chargement
- mixin `loadingBehavior` via `behaviors: [loadingBehavior]`
- Bouton "Load Data" → démonstration `withLoading()` avec succès
- Bouton "Trigger Error" → démonstration `withLoading()` avec erreur
- UI réactive montrant `isLoading`, `hasError`, `errorMessage`, `behaviorResult`

### Modal bottom sheet
- `app-modal` avec `placement="bottom"`
- Slots `header`, `content`, `footer`
- Fermeture par overlay + bouton

## Composants utilisés

Enregistrés dans `index.json` :
- `app-nav-bar`, `app-button`, `app-modal`, `app-stepper`, `app-typography`, `app-card`

## Voir aussi

- [Home Page](../index/README.md) — montre le pattern d'abonnement manuel EventBus
- [Components Overview](../../docs/08-components-overview.md) — catalogue complet des composants
- [WXS Filters Guide](../../docs/10-wxs-filters.md)
- [Behaviors Guide](../../docs/11-behaviors-guide.md)
