import { toggleFavoriteId } from '../../utils/helpers/favorites';
import { prepareDestinationDetail } from '../../utils/helpers/destinations.js';
import { loadDestination } from '../../utils/helpers/catalog';
import { withLock } from '../../utils/helpers/interaction.js';
import { storage } from '../../utils/storage.js';
import { getDestinations, getRecommendedDestinations } from '../../utils/stores/catalog-store.js';

Page({
  data: {
    destination: null,
    isLiked: false,
    hasDestination: false,
    isLoading: true,
    pageTopOffset: 36,
    showPreview: false,
    previewIndex: 0,
    previewGallery: [],
  },

  async onLoad(options = {}) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;
    const pageTopOffset = statusBarHeight + 16;

    if (!options.id) {
      this.setData({
        pageTopOffset,
        isLoading: false,
        hasDestination: false,
      });
      wx.showToast({
        title: 'Destination introuvable',
        icon: 'none',
      });
      return;
    }

    const app = getApp();
    const targetId = String(options.id);

    // 1. Récupération instantanée multi-sources (ZÉRO ÉCRAN BLANC)
    const currentDest = (app && app.globalData && app.globalData.CURRENT_DESTINATION) || storage.get('CURRENT_DESTINATION', null);
    const isCurrentMatch = currentDest && String(currentDest.id) === targetId;

    const catalogDestinations = (app && app.globalData && Array.isArray(app.globalData.DESTINATIONS))
      ? app.globalData.DESTINATIONS
      : [];
    const storeDestinations = [...getDestinations(), ...getRecommendedDestinations()];

    const allSources = [
      isCurrentMatch ? currentDest : null,
      ...catalogDestinations,
      ...storeDestinations,
      currentDest,
    ].filter(Boolean);

    const matchedDest = allSources.find((item) => String(item.id) === targetId);

    // UN SEUL setData synchrone dès la première frame : élimine le flash blanc
    if (matchedDest) {
      const normalizedDestination = prepareDestinationDetail(matchedDest);
      this.setData({
        pageTopOffset,
        destination: normalizedDestination,
        isLiked: Boolean(normalizedDestination.like),
        hasDestination: true,
        isLoading: false,
      });
    } else {
      this.setData({
        pageTopOffset,
        isLoading: true,
        hasDestination: false,
      });
    }

    // 2. Charger les détails complets (galerie, description) en arrière-plan
    try {
      const destination = await loadDestination(options.id);
      if (destination) {
        const normalizedDestination = prepareDestinationDetail(destination);
        this.setData({
          destination: normalizedDestination,
          isLiked: Boolean(normalizedDestination.like),
          hasDestination: true,
        });
      }
    } catch (error) {
      if (!this.data.hasDestination) {
        wx.showToast({
          title: error.message || 'Détail indisponible',
          icon: 'none',
        });
      }
    } finally {
      this.setData({ isLoading: false });
    }
  },

  handleBack: withLock(function () {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.redirectTo({
      url: '/pages/home/home',
    });
  }, 500),

  handleToggleLike: withLock(function () {
    const { destination, isLiked } = this.data;
    if (!destination) return;

    const nextLiked = !isLiked;

    // 1. Sauvegarder dans le stockage persistant
    toggleFavoriteId(destination.id, nextLiked);

    // 2. Mettre à jour app.globalData.DESTINATIONS
    const app = getApp();
    const currentDestinations = (app && app.globalData && Array.isArray(app.globalData.DESTINATIONS))
      ? app.globalData.DESTINATIONS
      : [];

    const updatedDestinations = currentDestinations.map((item) => (
      String(item.id) === String(destination.id)
        ? { ...item, like: nextLiked }
        : item
    ));

    if (app && app.globalData) {
      app.globalData.DESTINATIONS = updatedDestinations;
    }

    this.setData({
      isLiked: nextLiked,
      destination: {
        ...destination,
        like: nextLiked,
      },
    });
  }, 300),

  handleReserve: withLock(function () {
    const { destination } = this.data;
    if (!destination || !destination.id) return;

    wx.navigateTo({
      url: `/pages/booking/booking?destinationId=${destination.id}`,
    });
  }, 500),

  handlePreviewGallery(event) {
    const destination = this.data.destination;

    if (!destination) return;

    const gallery = Array.isArray(destination.gallery)
      ? destination.gallery.filter((img) => typeof img === 'string' && img.length > 0)
      : [];

    if (gallery.length === 0) {
      wx.showToast({
        title: 'Aucune image',
        icon: 'none',
      });
      return;
    }

    let index = Number(event.currentTarget.dataset.index);

    if (!Number.isFinite(index) || index < 0 || index >= gallery.length) {
      index = 0;
    }

    this.setData({
      showPreview: true,
      previewIndex: index,
      previewGallery: gallery,
    });
  },

  closePreview() {
    this.setData({
      showPreview: false,
    });
  },

  prevPreviewImage() {
    const { previewIndex, previewGallery } = this.data;
    const length = previewGallery.length;

    this.setData({
      previewIndex: (previewIndex - 1 + length) % length,
    });
  },

  nextPreviewImage() {
    const { previewIndex, previewGallery } = this.data;
    const length = previewGallery.length;

    this.setData({
      previewIndex: (previewIndex + 1) % length,
    });
  },

  onPreviewChange(e) {
    this.setData({
      previewIndex: e.detail.current,
    });
  },
});
