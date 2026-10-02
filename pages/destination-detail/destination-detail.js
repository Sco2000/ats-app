import { toggleFavoriteId } from '../../utils/helpers/favorites';
import { prepareDestinationDetail } from '../../utils/helpers/destinations.js';
import { loadDestination } from '../../utils/helpers/catalog';
import { withLock } from '../../utils/helpers/interaction.js';

const app = getApp();

Page({
  data: {
    destination: null,
    isLiked: false,
    hasDestination: false,
    isLoading: false,
    pageTopOffset: 32,
    showPreview: false,
    previewIndex: 0,
    previewGallery: [],
  },

  async onLoad(options = {}) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;

    this.setData({
      pageTopOffset: statusBarHeight + 16,
    });

    if (!options.id) {
      wx.showToast({
        title: 'Destination introuvable',
        icon: 'none',
      });
      return;
    }

    // 1. Récupération instantanée depuis la mémoire pour un affichage immédiat et naturel
    const currentDest = app && app.globalData && app.globalData.CURRENT_DESTINATION;
    const isCurrentMatch = currentDest && String(currentDest.id) === String(options.id);
    const catalogDestinations = (app && app.globalData && Array.isArray(app.globalData.DESTINATIONS))
      ? app.globalData.DESTINATIONS
      : [];
    const matchedDest = isCurrentMatch
      ? currentDest
      : catalogDestinations.find((d) => String(d.id) === String(options.id));

    if (matchedDest) {
      const normalizedDestination = prepareDestinationDetail(matchedDest);
      this.setData({
        destination: normalizedDestination,
        isLiked: Boolean(normalizedDestination.like),
        hasDestination: true,
      });
    }

    // 2. Si aucune donnée en mémoire, activer l'état de chargement local sans modal bloquant
    if (!matchedDest) {
      this.setData({ isLoading: true });
    }

    // 3. Charger les détails complets (galerie, description) en arrière-plan
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
    const updatedDestinations = (app.globalData.DESTINATIONS || []).map((item) => (
      String(item.id) === String(destination.id)
        ? { ...item, like: nextLiked }
        : item
    ));

    app.globalData.DESTINATIONS = updatedDestinations;

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
