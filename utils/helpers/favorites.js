// ============================================================================
// FAVORITES HELPER (Local Storage Persistence)
// ============================================================================

import { storage } from '../storage.js';

const STORAGE_KEY = 'ats_favorite_ids';

/**
 * Récupère la liste des IDs favoris depuis le stockage local sécurisé.
 * @returns {Array<string|number>}
 */
export function getFavoriteIds() {
  const ids = storage.get(STORAGE_KEY, []);
  return Array.isArray(ids) ? ids : [];
}

/**
 * Vérifie si un ID fait partie des favoris.
 * @param {string|number} id 
 * @returns {boolean}
 */
export function isFavorite(id) {
  const ids = getFavoriteIds();
  return ids.some((savedId) => String(savedId) === String(id));
}

/**
 * Ajoute ou retire un ID des favoris dans le stockage local sécurisé.
 * @param {string|number} id - L'ID du package
 * @param {boolean} isLiked - true pour ajouter, false pour retirer
 * @returns {Array<string|number>} Nouvelle liste d'IDs favoris
 */
export function toggleFavoriteId(id, isLiked) {
  const currentIds = getFavoriteIds();
  let nextIds;

  if (isLiked) {
    if (!currentIds.some((savedId) => String(savedId) === String(id))) {
      nextIds = [...currentIds, id];
    } else {
      nextIds = currentIds;
    }
  } else {
    nextIds = currentIds.filter((savedId) => String(savedId) !== String(id));
  }

  storage.set(STORAGE_KEY, nextIds);
  return nextIds;
}

/**
 * Applique l'état 'like' (true/false) à une liste de packages
 * en se basant sur les IDs enregistrés dans le stockage local.
 * @param {Array<Object>} packages 
 * @returns {Array<Object>}
 */
export function applyFavoritesToPackages(packages = []) {
  if (!Array.isArray(packages)) return [];
  const favoriteIds = getFavoriteIds().map(String);

  return packages.map((pkg) => ({
    ...pkg,
    like: favoriteIds.includes(String(pkg.id)),
  }));
}
