import { backendAPI } from '../apis/index';
import {
  getDestinations,
  getFilters,
  setDestinations,
  setFilters,
  updateDestinationLike as updateStoredDestinationLike,
} from '../stores/catalog-store';

const DEFAULT_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dakar', label: 'Dakar' },
  { id: 'saly', label: 'Saly' },
  { id: 'sine-saloum', label: 'Sine Saloum' },
  { id: 'saint-louis', label: 'Saint Louis' },
  { id: 'lompoul', label: 'Lompoul' },
  { id: 'experience-locale', label: 'Experience Locale' },
];

let destinationsPromise = null;
let filtersPromise = null;
let destinationsError = null;
let filtersError = null;

export function getCatalogStatus() {
  return { destinationsError, filtersError };
}

export async function loadDestinations({ fallback = [], force = false } = {}) {
  if (!force && destinationsPromise) return destinationsPromise;

  destinationsPromise = backendAPI.getPackages()
    .then((destinations) => {
      destinationsError = null;
      return setDestinations(destinations);
    })
    .catch((error) => {
      destinationsError = error;
      return setDestinations(fallback);
    })
    .finally(() => {
      destinationsPromise = null;
    });

  return destinationsPromise;
}

export async function loadCategoryFilters({ force = false } = {}) {
  const cachedFilters = getFilters();

  if (!force && cachedFilters.length > 0) {
    return cachedFilters;
  }

  if (!force && filtersPromise) return filtersPromise;

  filtersPromise = backendAPI.getCategories()
    .then((filters) => {
      filtersError = null;
      const nextFilters = Array.isArray(filters) && filters.length > 0 ? filters : DEFAULT_FILTERS;
      return setFilters(nextFilters);
    })
    .catch((error) => {
      filtersError = error;
      return setFilters(DEFAULT_FILTERS);
    })
    .finally(() => {
      filtersPromise = null;
    });

  return filtersPromise;
}

export async function refreshDestinations(options = {}) {
  return loadDestinations({ ...options, force: true });
}

export function getCatalogDestinations() {
  return getDestinations();
}

export function updateDestinationLike(id, like) {
  return updateStoredDestinationLike(id, like);
}

export function syncGlobalDestinations(app, destinations = getDestinations()) {
  if (app && app.globalData) {
    app.globalData.DESTINATIONS = destinations;
  }

  return destinations;
}

export { DEFAULT_FILTERS };
