const app = getApp();

const DEFAULT_DESCRIPTION = "Découvrez cette expérience pensée pour profiter pleinement du Sénégal, entre paysages naturels, moments de détente et découvertes locales. Vous pourrez explorer les lieux emblématiques, observer la vie autour de vous et vivre une sortie simple, confortable et mémorable.";

const DEFAULT_GALLERY = [
  '/assets/images/img.jpg',
  '/assets/images/pirogue.jpg',
  '/assets/images/bord.jpg',
  '/assets/images/ranch.png',
  '/assets/images/ile.png',
];

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

function findDestination(id) {
  const destinations = Array.isArray(app.globalData.DESTINATIONS)
    ? app.globalData.DESTINATIONS
    : [];

  return destinations.find((destination) => String(destination.id) === String(id));
}

function buildGallery(destination) {
  const customGallery = Array.isArray(destination.gallery) ? destination.gallery : [];
  const gallery = customGallery.length
    ? customGallery
    : [destination.image, ...DEFAULT_GALLERY];

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
  const reviewCount = Number(destination.reviewCount || 203);

  return {
    ...destination,
    heroImage: destination.heroImage || destination.image,
    description: destination.description || DEFAULT_DESCRIPTION,
    rating: destination.rating || '5.0',
    reviewCount,
    reviewLabel: `(${reviewCount} avis)`,
    duration: destination.duration || 'Demi-journée',
    category: destination.category || destination.city || 'Dakar',
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
    pageTopOffset: 32,
    showPreview: false,
    previewIndex: 0,
    previewGallery: [],
  },

  onLoad(options = {}) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;
    const destination = findDestination(options.id);

    if (!destination) {
      wx.showToast({
        title: 'Destination introuvable',
        icon: 'none',
      });
      return;
    }

    const normalizedDestination = normalizeDestination(destination);

    this.setData({
      destination: normalizedDestination,
      isLiked: Boolean(normalizedDestination.like),
      hasDestination: true,
      pageTopOffset: statusBarHeight + 16,
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

    wx.redirectTo({
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
    const updatedDestinations = (app.globalData.DESTINATIONS || []).map((item) => (
      item.id === destination.id
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
    ? destination.gallery.filter(img => typeof img === 'string' && img.length > 0)
    : [];

  if (gallery.length === 0) {
    wx.showToast({
      title: 'Aucune image',
      icon: 'none'
    });
    return;
  }

  let index = Number(event.currentTarget.dataset.index);

  if (!Number.isFinite(index) || index < 0 || index >= gallery.length) {
    index = 0;
  }

  console.log('[preview] custom modal', { index, gallery });

  this.setData({
    showPreview: true,
    previewIndex: index,
    previewGallery: gallery
  });
},

closePreview() {
  this.setData({
    showPreview: false
  });
},

prevPreviewImage() {
  const { previewIndex, previewGallery } = this.data;
  const length = previewGallery.length;

  this.setData({
    previewIndex: (previewIndex - 1 + length) % length
  });
},

nextPreviewImage() {
  const { previewIndex, previewGallery } = this.data;
  const length = previewGallery.length;

  this.setData({
    previewIndex: (previewIndex + 1) % length
  });
},

onPreviewChange(e) {
  this.setData({
    previewIndex: e.detail.current
  });
}
});
