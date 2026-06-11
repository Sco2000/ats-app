import { MAIN_TABS } from '../../utils/constants/index';
import { navigateTo } from '../../utils/helpers/navigation';

const app = getApp();

function formatFavoritesLabel(count) {
  return `${count} destination${count === 1 ? '' : 's'} sauvegardée${count === 1 ? '' : 's'}`;
}

Page({
  data: {
    activeTab: 'favorites',
    tabs: MAIN_TABS,
    allDestinations: [],
    favoriteDestinations: [],
    resultsLabel: '0 destination sauvegardée',
  },

  onLoad() {
    this.refreshFavorites();
  },

  onShow() {
    this.refreshFavorites();
  },

  refreshFavorites() {
    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];

    const favoriteDestinations = destinations.filter((destination) => Boolean(destination.like));

    this.setData({
      allDestinations: destinations,
      favoriteDestinations,
      resultsLabel: formatFavoritesLabel(favoriteDestinations.length),
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

    app.globalData.DESTINATIONS = updatedDestinations;

    const favoriteDestinations = updatedDestinations.filter((item) => Boolean(item.like));

    this.setData({
      allDestinations: updatedDestinations,
      favoriteDestinations,
      resultsLabel: formatFavoritesLabel(favoriteDestinations.length),
    });
  },
});
