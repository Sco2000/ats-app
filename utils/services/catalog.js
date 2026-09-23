import { backendAPI } from '../apis/index';

const DEFAULT_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dakar', label: 'Dakar' },
  { id: 'saly', label: 'Saly' },
  { id: 'sine-saloum', label: 'Sine Saloum' },
  { id: 'saint-louis', label: 'Saint Louis' },
  { id: 'lompoul', label: 'Lompoul' },
  { id: 'experience-locale', label: 'Experience Locale' },
];

export async function loadCategoryFilters() {
  try {
    const filters = await backendAPI.getCategories();

    if (!Array.isArray(filters) || filters.length === 0) {
      return DEFAULT_FILTERS;
    }

    return filters;
  } catch (error) {
    console.warn('[Catalog] Categories API failed, using default filters:', error);
    return DEFAULT_FILTERS;
  }
}

export { DEFAULT_FILTERS };