import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { waitForAppInit } from '../../utils/helpers/app-init';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import {
  DEFAULT_FILTERS,
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
    allDestinations: app.globalData.DESTINATIONS,
    destinations: app.globalData.DESTINATIONS,
    filters: DEFAULT_FILTERS,
    activeFilter: 'all',
  },

  onLoad() {
    this.loadFilters();
  },

  async loadFilters() {
    const filters = await loadCategoryFilters();

    const nextActiveFilter = filters.some((filter) => filter.id === this.data.activeFilter)
      ? this.data.activeFilter
      : 'all';

    this.setData({
      filters,
      activeFilter: nextActiveFilter,
    }, () => {
      this.applyFilters();
    });
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

    this.setData({ destinations });
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
    await this.refreshDestinations();
  }
});
