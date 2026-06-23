import { MAIN_TABS } from '../../utils/constants/index';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

const app = getApp();

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatResultsLabel(count) {
  return `${count} destination${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}`;
}

Page({
  data: {
    activeTab: 'explorer',
    tabs: MAIN_TABS,
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
    const { allDestinations, searchValue, activeFilter } = this.data;
    const query = normalizeText(searchValue.trim());

    const visibleDestinations = (allDestinations || []).filter((destination) => {
      const destinationTags = Array.isArray(destination.tags) ? destination.tags : [];
      const searchableText = normalizeText([
        destination.title,
        destination.subtitle,
        destination.city,
        ...destinationTags,
      ].join(' '));

      const matchesQuery = !query || searchableText.includes(query);
      const matchesFilter = activeFilter === 'all'
        || destinationTags.includes(activeFilter)
        || normalizeText(destination.city).includes(activeFilter);

      return matchesQuery && matchesFilter;
    });

    this.setData({
      visibleDestinations,
      resultsLabel: formatResultsLabel(visibleDestinations.length),
    });
  },

  onSearchInput(event) {
    const searchValue = event.detail.value || '';
    this.setData({ searchValue }, () => {
      this.applyFilters();
    });
  },

  handleFilterChange(event) {
    this.setData({
      activeFilter: event.detail.id,
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
