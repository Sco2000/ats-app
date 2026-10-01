import { toggleFavoriteId } from '../../utils/helpers/favorites';
import { prepareDestinationDetail } from '../../utils/helpers/destinations.js';
import { loadDestination } from '../../utils/helpers/catalog';

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

    wx.showLoading({
      title: 'Chargement',
      mask: true,
    });
    this.setData({ isLoading: true });

    let destination = null;

    try {
      destination = await loadDestination(options.id);
    } catch (error) {
      wx.showToast({
        title: error.message || 'Detail indisponible',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
      this.setData({ isLoading: false });
    }

    if (!destination) {
      wx.showToast({
        title: 'Destination introuvable',
        icon: 'none',
      });
      return;
    }

    const normalizedDestination = prepareDestinationDetail(destination);
    const isLiked = normalizedDestination.like;

    this.setData({
      destination: normalizedDestination,
      isLiked,
      hasDestination: true,
    });
  },

  handleBack() {
    if (this._backLocked) {
      return;
    }

    this._backLocked = true;
    setTimeout(() => {
      this._backLocked = false;
    }, 500);

    const pages = getCurrentPages();

    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.switchTab({
      url: '/pages/home/home',
    });
  },

  handleToggleLike() {
    const { destination, isLiked } = this.data;

    if (!destination || this._likeLocked) {
      return;
    }

    this._likeLocked = true;
    setTimeout(() => {
      this._likeLocked = false;
    }, 300);

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
  },

  handleReserve() {
    const { destination } = this.data;

    if (!destination || !destination.id || this._bookingLocked) {
      return;
    }

    this._bookingLocked = true;
    setTimeout(() => {
      this._bookingLocked = false;
    }, 500);

    wx.navigateTo({
      url: `/pages/booking/booking?destinationId=${destination.id}`,
    });
  },

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
