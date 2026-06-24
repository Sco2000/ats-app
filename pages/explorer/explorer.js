import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

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
    filters: [
      { id: 'all', label: 'Tous' },
      { id: 'dakar', label: 'Dakar' },
      { id: 'saly', label: 'Saly' },
      { id: 'sine-saloum', label: 'Sine Saloum' },
      { id: 'saint-louis', label: 'Saint Louis' },
      { id: 'lompoul', label: 'Lompoul' },
      { id: 'experience-locale', label: 'Experience Locale' },
    ],
    allDestinations: [],
    visibleDestinations: [],
    resultsLabel: '0 destination disponible',
  },

  onLoad() {
    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];

    this.setData({
      allDestinations: destinations,
    }, () => {
      this.applyFilters();
    });
  },

  onShow() {
    setCustomTabBarActive(this, 'explorer');

    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];

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

    const updatedDestinations = (this.data.allDestinations || []).map((item) => (
      item.id === destination.id
        ? { ...item, like }
        : item
    ));

    this.setData({
      allDestinations: updatedDestinations,
    }, () => {
      this.applyFilters();
    });

    app.globalData.DESTINATIONS = updatedDestinations;
  },
});
