import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { waitForAppInit } from '../../utils/helpers/app-init';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

import {
  DEFAULT_FILTERS,
  getCatalogStatus,
  getCatalogDestinations,
  loadCategoryFilters,
  syncGlobalDestinations,
  updateDestinationLike,
} from '../../utils/services/catalog';

const app = getApp();

function formatResultsLabel(count) {
  return `${count} destination${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}`;
}

Page({
  data: {
    activeTab: 'explorer',
    tabs: MAIN_TABS,
    query: '',
    searchValue: '',
    activeFilter: 'all',
    filters: DEFAULT_FILTERS,
    allDestinations: [],
    visibleDestinations: [],
    resultsLabel: '0 destination disponible',
    isLoading: true,
    errorMessage: '',
    isEmpty: false,
  },

  onLoad() {
    this.initializeCatalog();
  },

  async initializeCatalog() {
    if (this._loadingCatalog) return;
    this._loadingCatalog = true;
    this.setData({ isLoading: true, errorMessage: '' });

    await waitForAppInit(app);
    const filters = await loadCategoryFilters();
    const allDestinations = getCatalogDestinations();
    const { destinationsError, filtersError } = getCatalogStatus();
    const error = destinationsError || filtersError;

    const nextActiveFilter = filters.some((filter) => filter.id === this.data.activeFilter)
      ? this.data.activeFilter
      : 'all';
    const currentQuery = this.data.query || this.data.searchValue;
    const visibleDestinations = filterDestinations(allDestinations, currentQuery, nextActiveFilter);

    this.setData({
      allDestinations,
      visibleDestinations,
      resultsLabel: formatResultsLabel(visibleDestinations.length),
      filters,
      activeFilter: nextActiveFilter,
      isLoading: false,
      isEmpty: visibleDestinations.length === 0,
      errorMessage: error ? 'Impossible de charger les destinations. Réessaie plus tard.' : '',
    });
    this._loadingCatalog = false;
  },

  async onShow() {
    setCustomTabBarActive(this, 'explorer');
    if (!this._loadingCatalog) {
      await this.refreshDestinations();
    }
  },

  async refreshDestinations() {
    await waitForAppInit(app);

    const destinations = getCatalogDestinations();

    this.setData({
      allDestinations: destinations,
    }, () => {
      this.applyFilters();
    });
  },

  applyFilters() {
    const { allDestinations, query, searchValue, activeFilter } = this.data;
    const currentQuery = query === undefined || query === null ? searchValue : query;
    const visibleDestinations = filterDestinations(
      allDestinations,
      currentQuery,
      activeFilter
    );

    this.setData({
      visibleDestinations,
      resultsLabel: formatResultsLabel(visibleDestinations.length),
      isEmpty: visibleDestinations.length === 0,
    });
  },

  onInput(event) {
    const query = event.detail.value || '';
    this.setData({ query, searchValue: query }, () => {
      this.applyFilters();
    });
  },

  onSearchInput(event) {
    this.onInput(event);
  },

  onSearch() {
    this.applyFilters();
  },

  handleFilterChange(event) {
    this.setData({
      activeFilter: event.detail.id || 'all',
    }, () => {
      this.applyFilters();
    });
  },

  handleCardPress(event) {
    const { destination } = event.detail || {};

    if (!destination || !destination.id || this._openingDestinationDetail) {
      return;
    }

    this._openingDestinationDetail = true;
    const releaseNavigation = () => {
      setTimeout(() => {
        this._openingDestinationDetail = false;
      }, 500);
    };

    navigateTo(`/pages/destination-detail/destination-detail?id=${destination.id}`)
      .then(releaseNavigation, releaseNavigation);
  },

  handleDestinationLike(event) {
    const { destination, like } = event.detail;

    if (!destination) {
      return;
    }

    const updatedDestinations = updateDestinationLike(destination.id, like);

    this.setData({
      allDestinations: updatedDestinations,
    }, () => {
      this.applyFilters();
    });

    syncGlobalDestinations(app, updatedDestinations);
  },
});
