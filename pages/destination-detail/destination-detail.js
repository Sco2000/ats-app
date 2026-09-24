import { backendAPI } from '../../utils/apis/index';
import { isFavorite, toggleFavoriteId } from '../../utils/helpers/favorites';

const app = getApp();

const DEFAULT_DESCRIPTION = "Découvrez cette expérience pensée pour profiter pleinement du Sénégal, entre paysages naturels, moments de détente et découvertes locales. Vous pourrez explorer les lieux emblématiques, observer la vie autour de vous et vivre une sortie simple, confortable et mémorable.";

function uniqueImages(images = []) {
  const seen = {};

  return images.filter((image) => {
    if (!image || seen[image]) {
      return false;
    }

    seen[image] = true;
    return true;
  });
}

function buildGallery(destination) {
  const customGallery = Array.isArray(destination.gallery) ? destination.gallery : [];
  const gallery = customGallery.length
    ? customGallery
    : [destination.image];

  return uniqueImages(gallery);
}

function getGalleryMode(count) {
  if (count <= 1) {
    return 'single';
  }

  if (count === 2) {
    return 'double';
  }

  return 'mosaic';
}

function normalizeDestination(destination) {
  const gallery = buildGallery(destination);
  const reviewCount = Number(destination.reviewCount || 0);

  return {
    ...destination,
    heroImage: destination.heroImage || destination.image,
    description: destination.description || '',
    rating: destination.rating || '',
    reviewCount,
    reviewLabel: `(${reviewCount} avis)`,
    duration: destination.duration || '',
    category: destination.category || destination.city || '',
    gallery,
    galleryMode: getGalleryMode(gallery.length),
    mainGalleryImage: gallery[0] || '',
    remainingGalleryImages: gallery.slice(1),
  };
}

Page({
  data: {
    destination: null,
    isLiked: false,
    stars: [1, 2, 3, 4, 5],
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
      destination = await backendAPI.getPackage(options.id);
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

    const isLiked = isFavorite(destination.id);
    const normalizedDestination = normalizeDestination({
      ...destination,
      like: isLiked,
    });

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
      wx.navigateBack();
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
