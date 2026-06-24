import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

const app = getApp();

Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    query: '',
    allDestinations: app.globalData.DESTINATIONS,
    destinations: app.globalData.DESTINATIONS,
    filters: [
      { id: 'all', label: 'Tous' },
      { id: 'dakar', label: 'Dakar' },
      { id: 'saly', label: 'Saly' },
      { id: 'sine-saloum', label: 'Sine Saloum' },
      { id: 'saint-louis', label: 'Saint Louis' },
      { id: 'lompoul', label: 'Lompoul' },
      { id: 'experience-locale', label: 'Experience Locale' },
    ],
    activeFilter: 'all',
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

  refreshDestinations() {
    const allDestinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];

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

    const sourceDestinations = Array.isArray(this.data.allDestinations)
      ? this.data.allDestinations
      : [];
    const updatedDestinations = sourceDestinations.map((item) => (
      item.id === destination.id
        ? { ...item, like }
        : item
    ));

    app.globalData.DESTINATIONS = updatedDestinations;
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

  onShow() {
    setCustomTabBarActive(this, 'home');
    this.refreshDestinations();
  }
});
