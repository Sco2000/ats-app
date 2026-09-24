import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { navigateTo } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { backendAPI } from '../../utils/apis/index';
import { applyFavoritesToPackages, toggleFavoriteId } from '../../utils/helpers/favorites';
import {
  DEFAULT_FILTERS,
  getCatalogRecommendedDestinations,
  loadRecommendedDestinations,
  loadCategoryFilters,
  syncGlobalDestinations,
  updateDestinationLike,
} from '../../utils/services/catalog';


const app = getApp();

Page({


  /**
   * Fonction appelée au chargement de la page
   */
  onLoad() {
    this.refreshPackages();
  },

  async refreshPackages() {
    this.setData({ destinationsLoading: true, destinationsError: false });
    try {
      const rawPackages = await backendAPI.getPackages();
      const packages = applyFavoritesToPackages(rawPackages);

      app.globalData.DESTINATIONS = packages;
      app.globalData.CATALOG_ERROR = false;

      this.setData({
        allDestinations: packages,
        destinations: packages
      }, () => {
        this.applyFilters();
      });

    } catch (error) {
      console.error("Erreur lors du chargement des packages :", error);
      app.globalData.CATALOG_ERROR = true;
      this.setData({ destinationsError: true });
    } finally {
      this.setData({ destinationsLoading: false });
    }
  },

  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    query: '',
    allDestinations: [],
    destinations: [],
    destinationsRecommended: [],
    destinationsLoading: true,
    recommendedLoading: true,
    recommendedError: false,
    destinationsError: false,
    filters: DEFAULT_FILTERS,
    activeFilter: 'all',
  },

  applyFilters() {
    const allDestinations = Array.isArray(this.data.allDestinations)
      ? this.data.allDestinations
      : [];
      
    const destinationsRecommended = getCatalogRecommendedDestinations();

    const destinations = filterDestinations(
      allDestinations,
      this.data.query,
      this.data.activeFilter
    );

    this.setData({ destinations, destinationsRecommended });
  },

  async refreshDestinations() {
    this.setData({ recommendedLoading: true, recommendedError: false });
    try {
      await loadRecommendedDestinations({
        onError: () => this.setData({ recommendedError: true }),
      });
      this.setData({ destinationsRecommended: getCatalogRecommendedDestinations() });
    } catch (error) {
      this.setData({ recommendedError: true });
    } finally {
      this.setData({ recommendedLoading: false });
    }
  },

  retryPackages() {
    this.refreshPackages();
  },

  retryRecommendations() {
    this.refreshDestinations();
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

    // 1. Sauvegarder dans le stockage local persistant
    toggleFavoriteId(destination.id, like);

    // 2. Mettre à jour la liste en mémoire
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
