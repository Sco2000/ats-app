import { backendAPI } from '../apis/index.js';
import {
  getDestinations,
  getRecommendedDestinations,
  getFeaturedDestinations,
  getFilters,
  setDestinations,
  setRecommendedDestinations,
  setFeaturedDestinations,
  setFilters,
  updateDestinationLike as updateStoredDestinationLike,
} from '../stores/catalog-store.js';

const DEFAULT_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dakar', label: 'Dakar' },
  { id: 'saly', label: 'Saly' },
  { id: 'saloum', label: 'Saloum' },
  { id: 'somone', label: 'Somone' },
  { id: 'saint-louis', label: 'Saint Louis' },
  { id: 'lompoul', label: 'Lompoul' },
  { id: 'casamance', label: 'Casamance' },
  { id: 'kedougou', label: 'Kédougou' },
  { id: 'experiences-locales', label: 'Expériences locales' },
];

export async function loadDestinations({ fallback = [], onError, throwOnError = false } = {}) {
  try {
    const destinations = await backendAPI.getPackages();
    return setDestinations(destinations);
  } catch (error) {
    console.warn('[Catalog] Packages API failed, using fallback destinations:', error);
    if (typeof onError === 'function') onError(error);
    if (throwOnError) throw error;
    return setDestinations(fallback);
  }
}

export function loadDestination(id) {
  return backendAPI.getPackage(id);
}

export async function loadRecommendedDestinations({ fallback = [], onError } = {}) {
  try {
    const destinations = await backendAPI.getRecommendedPackages();
    return setRecommendedDestinations(destinations);
  } catch (error) {
    console.warn('[Catalog] Recommended packages API failed, using fallback destinations:', error);
    if (typeof onError === 'function') onError(error);
    return setRecommendedDestinations(fallback);
  }
}

export async function loadFeaturedDestinations({ fallback = [], onError } = {}) {
  try {
    const destinations = await backendAPI.getFeaturedPackages();
    return setFeaturedDestinations(destinations);
  } catch (error) {
    console.warn('[Catalog] Featured packages API failed:', error);
    if (typeof onError === 'function') onError(error);
    return setFeaturedDestinations(fallback);
  }
}

export async function loadCategoryFilters({ force = false } = {}) {
  const cachedFilters = getFilters();
  if (!force && cachedFilters.length > 0) return cachedFilters;

  try {
    const filters = await backendAPI.getCategories();
    return setFilters(filters.length > 0 ? filters : DEFAULT_FILTERS);
  } catch (error) {
    console.warn('[Catalog] Categories API failed, using default filters:', error);
    return setFilters(DEFAULT_FILTERS);
  }
}

export function getCatalogDestinations() {
  return getDestinations();
}

export function getCatalogRecommendedDestinations() {
  return getRecommendedDestinations();
}

export function getCatalogFeaturedDestinations() {
  return getFeaturedDestinations();
}

export function updateDestinationLike(id, like) {
  return updateStoredDestinationLike(id, like);
}

export function syncGlobalDestinations(app, destinations = getDestinations()) {
  if (app && app.globalData) app.globalData.DESTINATIONS = destinations;
  return destinations;
}

export { DEFAULT_FILTERS };
