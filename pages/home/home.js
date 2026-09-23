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

Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    query: '',
    allDestinations: [],
    destinations: [],
    filters: DEFAULT_FILTERS,
    activeFilter: 'all',
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
    const [filters] = await Promise.all([loadCategoryFilters(), Promise.resolve(getCatalogDestinations())]);
    const allDestinations = getCatalogDestinations();
    const { destinationsError, filtersError } = getCatalogStatus();
    const error = destinationsError || filtersError;

    const nextActiveFilter = filters.some((filter) => filter.id === this.data.activeFilter)
      ? this.data.activeFilter
      : 'all';
    const destinations = filterDestinations(allDestinations, this.data.query, nextActiveFilter);

    this.setData({
      allDestinations,
      destinations,
      filters,
      activeFilter: nextActiveFilter,
      isLoading: false,
      isEmpty: destinations.length === 0,
      errorMessage: error ? 'Impossible de charger les destinations. Réessaie plus tard.' : '',
    });
    this._loadingCatalog = false;
  },

  applyFilters() {
    const allDestinations = Array.isArray(this.data.allDestinations)
      ? this.data.allDestinations
      : [];

    const destinations = filterDestinations(
      allDestinations,
      this.data.query,
      this.data.activeFilter
    );

    this.setData({ destinations, isEmpty: destinations.length === 0 });
  },

  async refreshDestinations() {
    await waitForAppInit(app);

    const allDestinations = getCatalogDestinations();

    this.setData({ allDestinations }, () => {
      this.applyFilters();
    });
  },

  onInput(event) {
    const query = event.detail.value || '';

    this.setData({ query }, () => {
      this.applyFilters();
    });
  },

  onSearch() {
    this.applyFilters();
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

    syncGlobalDestinations(app, updatedDestinations);
    this.setData({ allDestinations: updatedDestinations }, () => {
      this.applyFilters();
    });
  },

  handleFilterChange(event) {
    this.setData({
      activeFilter: event.detail.id || 'all',
    }, () => {
      this.applyFilters();
    });
  },

  handleShowAll() {
    wx.switchTab({
      url: '/pages/explorer/explorer',
    });
  },

  async onShow() {
    setCustomTabBarActive(this, 'home');
    if (!this._loadingCatalog) {
      await this.refreshDestinations();
    }
  }
});
